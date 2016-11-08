/// <reference path="./_references.ts" />

// TODO debug only?
import {assert} from './assert';

import {Inject, injectable, isAnnotated} from './di'
import {makeDecorator, Map, setIfInterface, create, isFunction, isDefined} from './utils'
import {FunctionReturningString, FunctionReturningNothing, parseSelector, SelectorType} from './utils'
import {hasOwnAnnotation, getAnnotations, mergeAnnotations, addAnnotation} from './reflection'



/**
 * TODO document
 */
export const enum Transclusion {
    Content,
    Element
}
const TRANSCLUSION_MAP = [true, 'element'];

type PrePost = {
    pre: FunctionReturningNothing,
    post: FunctionReturningNothing
};
type CompileFunction = (...args: any[]) => FunctionReturningNothing;
type FunctionReturningPrePost = (...args: any[]) => PrePost;

/**
 * TODO document
 */
export interface CommonDirectiveOptions {

    // name = element
    // .name = class
    // [name] = attribute
    // //name = comment (unavailable)
    selector: string;

    // infered from the selector
    //restrict?: Restriction|Restriction[]; // [Restriction.Element, Restriction.Element]

    scope?: boolean|Map<string>;
    bindToController?: boolean;

    require?: string[];

    // needs mapping
    transclude?: Transclusion; // Transclusion.Content

    compile?: CompileFunction|FunctionReturningPrePost;
    link?: FunctionReturningNothing|PrePost|string;

}

/**
 * @internal
 */
export class CommonDirectiveAnnotation {

    selector: string = void 0;
    scope: boolean|Map<string> = void 0;
    bindToController: boolean = void 0;
    require: string[] = void 0;
    transclude: Transclusion = void 0;
    compile: CompileFunction|FunctionReturningPrePost = void 0;
    link: FunctionReturningNothing|PrePost|string = void 0;

    constructor(options: CommonDirectiveOptions) {
        // TODO debug only?
        assert.notNull(options, 'options must not be null');
        assert.notEmpty(options.selector, 'selector must not be null or empty');

        setIfInterface(this, options);
    }

}

/**
 * TODO document
 */
export interface DirectiveOptions extends CommonDirectiveOptions {

    priority?: number;
    terminal?: boolean;
    multiElement?: boolean;

}

/**
 * @internal
 */
export class DirectiveAnnotation extends CommonDirectiveAnnotation {

    multiElement: boolean = void 0;
    priority: number = void 0;
    terminal: boolean = void 0;

    constructor(options: DirectiveOptions) {
        super(<any> options); // TODO WTF needs casting?
        setIfInterface(this, options);
    }

}

/**
 * TODO document
 */
export interface Directive {

}

/**
 * @internal
 */
export interface DirectiveConstructor extends Function {
    new (): Directive;
}

type DirectiveDecorator = (options: DirectiveOptions) => ClassDecorator;

/**
 *
 */
export var Directive = <DirectiveDecorator> makeDecorator(DirectiveAnnotation);

// ---



// @Bind

export class BindAnnotation {
    constructor(
        public propertyKey: string,
        public binding: string) {
    }
}

interface Bind {
    (binding: string): PropertyDecorator;
    value(binding: string): PropertyDecorator;
    reference(binding: string): PropertyDecorator;
    expression(binding: string): PropertyDecorator;
}

let bindDecorator: Bind = <any> function bindDecorator(binding: string): PropertyDecorator {

    return function(target: any, propertyKey: string) {

        var newBind = new BindAnnotation(propertyKey, binding);
        addAnnotation(target.constructor, newBind);

    }

}

let reBindings = /^(@|&|=)/;

bindDecorator.value = function(binding: string): PropertyDecorator {

    if (reBindings.test(binding)) {
        throw new Error("Invalid one-way binding: " + binding);
    }

    return bindDecorator("@" + binding);

};

bindDecorator.reference = function(binding: string): PropertyDecorator {

    if (reBindings.test(binding)) {
        throw new Error("Invalid two-way reference binding: " + binding);
    }

    return bindDecorator("=" + binding);

};

bindDecorator.expression = function(binding: string): PropertyDecorator {

    if (reBindings.test(binding)) {
        throw new Error("Invalid parent expression binding: " + binding);
    }

    return bindDecorator("&" + binding);

};

export var Bind = bindDecorator;

// ---



export function publishDirective(directiveClass: DirectiveConstructor, ngModule: ng.IModule, selector?: string): ng.IModule {

    // TODO debug only?
    assert(hasOwnAnnotation(directiveClass, DirectiveAnnotation), 'Did you decorate it with @Directive?');

    var {name, factory} = makeDirectiveFactory(directiveClass);

    // TODO consider provided selector, if any

    ngModule.directive(name, factory);

    return ngModule;

}

/**
 * @internal
 */
//export interface DirectiveDefinitionObject extends ng.IDirective { // bindToController incompatible with current angular.d.ts
export interface DirectiveDefinitionObject {
    multiElement?: boolean;
    compile?: CompileFunction|FunctionReturningPrePost;
    controller?: any;
    bindToController?: boolean|Map<string>;
    link?: FunctionReturningNothing|PrePost|string;
    name?: string;
    priority?: number;
    require?: string[];
    restrict?: string;
    scope?: boolean|Map<string>;
    terminal?: boolean;
    transclude?: boolean|string;

    semanticName: string;
    imperativeName: string;
}

const RESTRICTION_MAP: Map<string> = {
    [SelectorType.Attribute]: 'A',
    [SelectorType.Tag]: 'E',
    [SelectorType.Class]: 'C'
    //[SelectorType.Comment]: 'M'
};

/**
 * @internal
 */
export function makeCommonDO(directiveClass: DirectiveConstructor): DirectiveDefinitionObject {

    // Reflect.decorate apply decorators reversely, so we need to reverse
    // the extracted annotations before merging them
    // var aux = getAnnotations(directiveClass, CommonDirectiveAnnotation).reverse();
    var aux = getAnnotations(directiveClass, CommonDirectiveAnnotation);
    var annotation = <CommonDirectiveAnnotation> {/*no defaults*/};
    mergeAnnotations(annotation, ...aux);

    var selectorData = parseSelector(annotation.selector);

    var ddo: DirectiveDefinitionObject = {
        semanticName: selectorData.semanticeName,
        imperativeName: selectorData.imperativeName,
        restrict: RESTRICTION_MAP[selectorData.type],
        controller: directiveClass
    };

    if (isDefined(annotation.transclude)) ddo.transclude = TRANSCLUSION_MAP[annotation.transclude];
    if (isDefined(annotation.compile)) ddo.compile = annotation.compile;
    if (isDefined(annotation.link)) ddo.link = annotation.link;

    // Require
    ddo.require = isDefined(annotation.require) ? annotation.require.slice(0) : [ddo.imperativeName];
    if (ddo.require.indexOf(ddo.imperativeName) === -1) {
        ddo.require.push(ddo.imperativeName);
    }

    // scope
    if (isDefined(annotation.scope)) ddo.scope = annotation.scope;

    // bindToController
    // let bindAnnotations = <BindAnnotation[]> getAnnotations(directiveClass, BindAnnotation).reverse();
    let bindAnnotations = <BindAnnotation[]> getAnnotations(directiveClass, BindAnnotation);
    if (bindAnnotations.length) {
        let map: Map<string> = {};
        for (let bind of bindAnnotations) {
            map[bind.propertyKey] = bind.binding;
        }
        ddo.bindToController = map;
    }
    else if (isDefined(annotation.bindToController)) ddo.bindToController = annotation.bindToController;

    return ddo;

}

/**
 * @internal
 */
export function makeDirectiveDO(directiveClass: DirectiveConstructor): DirectiveDefinitionObject {

    var ddo = makeCommonDO(<DirectiveConstructor> directiveClass);

    // Reflect.decorate apply decorators reversely, so we need to reverse
    // the extracted annotations before merging them
    // var aux = getAnnotations(directiveClass, DirectiveAnnotation).reverse();
    var aux = getAnnotations(directiveClass, DirectiveAnnotation);
    var annotation = <DirectiveAnnotation> {/*no defaults*/};
    mergeAnnotations(annotation, ...aux);

    if (isDefined(annotation.multiElement)) ddo.multiElement = annotation.multiElement;
    if (isDefined(annotation.priority)) ddo.priority = annotation.priority;
    if (isDefined(annotation.terminal)) ddo.terminal = annotation.terminal;

    return ddo;

}

/**
 * @internal
 */
export function inFactory(ddo: DirectiveDefinitionObject, $injector: ng.auto.IInjectorService): DirectiveDefinitionObject {

    if (isFunction(ddo.compile)) {
        ddo.compile = !isAnnotated(ddo.compile) ? ddo.compile :
            (tElement: any, tAttrs: any, transclude: any) => {
                return $injector.invoke(ddo.compile, null, {
                    $element: tElement,
                    $attrs: tAttrs,
                    $transclude: transclude
                });
            }
    }

    if (typeof ddo.link === "string") {
        let linkFn = ddo.controller.prototype[<string> ddo.link];
        if (!isAnnotated(linkFn)) {
            ddo.link = function(scope: any, iElement: any, iAttrs: any, controllers: any[], transclude: any) {
                // let controller = angular.isArray(controllers) ? controllers[controllers.lenght - 1] : controllers;
                let controller = controllers[controllers.length - 1];
                linkFn.apply(controller, [].slice.call(arguments, 0));
            }
        }
        else {
            ddo.link = function(scope: any, iElement: any, iAttrs: any, controllers: any[], transclude: any) {
                // let controller = angular.isArray(controllers) ? controllers[controllers.lenght - 1] : controllers;
                let controller = controllers[controllers.length - 1];
                return $injector.invoke(<any> linkFn, controller, {
                    $scope: scope,
                    $element: iElement,
                    $attrs: iAttrs,
                    $controller: controller,   // TODO deprecated
                    $controllers: controllers,
                    $transclude: transclude
                });
            }
        }
    }
    else if (isAnnotated(<any> ddo.link)) {
        let linkFn = ddo.link;
        ddo.link = (scope: any, iElement: any, iAttrs: any, controllers: any[], transclude: any) => {
            let controller = controllers[controllers.length - 1];
            return $injector.invoke(<any> linkFn, controller, {
                $scope: scope,
                $element: iElement,
                $attrs: iAttrs,
                $controller: controller,   // TODO deprecated
                $controllers: controllers,
                $transclude: transclude
            });
        }
    }

    return ddo;

}

/**
 * @internal
 */
export function makeDirectiveFactory(directiveClass: DirectiveConstructor) {

    var ddo = makeDirectiveDO(directiveClass);

    var factory = injectable(['$injector'], function directiveFactory($injector: ng.auto.IInjectorService): ng.IDirective {
        return <any> inFactory(ddo, $injector);
    });

    return {
        name: ddo.imperativeName,
        factory: factory
    };

}