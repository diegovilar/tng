/// <reference path="./_references" />

// TODO debug only?
import {assert} from './assert';

import {Inject, bind, hasInjectAnnotation} from './di';
import {makeDecorator, Map, setIfInterface, create, isFunction, isDefined} from './utils';
import {FunctionReturningString, FunctionReturningNothing, parseSelector, SelectorType} from './utils';
import {hasAnnotation, getAnnotations, mergeAnnotations} from './reflection';

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

    // TODO Como simplificar
    // TODO depende de controllerAs?
    // TODO como realmente funciona bindToController no 1.4? Nas docs,
    //      ainda esta como boolean apenas, mas parece que pode ser um Map
    scope?: boolean|Map<string>;
    bind?: boolean|Map<string>;

    require?: string[];

    // needs mapping
    transclude?: Transclusion; // Transclusion.Content

    compile?: CompileFunction|FunctionReturningPrePost;
    link?: FunctionReturningNothing|PrePost;

}

/**
 * @internal
 */
export class CommonDirectiveAnnotation {

    selector: string = void 0;
    scope: boolean|Map<string> = void 0;
    bind: boolean|Map<string> = void 0;
    require: string[] = void 0;
    transclude: Transclusion = void 0;
    compile: CompileFunction|FunctionReturningPrePost = void 0;
    link: FunctionReturningNothing|PrePost = void 0;

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

export function publishDirective(directiveClass: DirectiveConstructor, ngModule: ng.IModule, selector?: string): ng.IModule {

    // TODO debug only?
    assert(hasAnnotation(directiveClass, DirectiveAnnotation), 'Did you decorate it with @Directive?');

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
    link?: FunctionReturningNothing|PrePost;
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
    var aux = getAnnotations(directiveClass, CommonDirectiveAnnotation).reverse();
    var annotation = <CommonDirectiveAnnotation> {/*no defaults*/};
    mergeAnnotations(annotation, ...aux);

    var selectorData = parseSelector(annotation.selector);

    var ddo: DirectiveDefinitionObject = {
        semanticName: selectorData.semanticeName,
        imperativeName: selectorData.imperativeName,
        restrict: RESTRICTION_MAP[selectorData.type],
        controller: directiveClass
    };

    if (annotation.scope != null) ddo.scope = annotation.scope;
    if (annotation.bind != null) ddo.bindToController = annotation.bind;
    if (annotation.transclude != null) ddo.transclude = TRANSCLUSION_MAP[annotation.transclude];
    if (annotation.compile != null) ddo.compile = annotation.compile;
    if (annotation.link != null) ddo.link = annotation.link;

    return ddo;

}

/**
 * @internal
 */
export function makeDirectiveDO(directiveClass: DirectiveConstructor): DirectiveDefinitionObject {

    var ddo = makeCommonDO(<DirectiveConstructor> directiveClass);

    // Reflect.decorate apply decorators reversely, so we need to reverse
    // the extracted annotations before merging them
    var aux = getAnnotations(directiveClass, DirectiveAnnotation).reverse();
    var annotation = <DirectiveAnnotation> {/*no defaults*/};
    mergeAnnotations(annotation, ...aux);

    if (annotation.multiElement != null) ddo.multiElement = annotation.multiElement;
    if (annotation.priority != null) ddo.priority = annotation.priority;
    if (annotation.terminal != null) ddo.terminal = annotation.terminal;

    return ddo;

}

/**
 * @internal
 */
export function inFactory(ddo: DirectiveDefinitionObject, $injector: ng.auto.IInjectorService): DirectiveDefinitionObject {

    if (isFunction(ddo.compile)) {
        ddo.compile = !hasInjectAnnotation(ddo.compile) ? ddo.compile :
            (tElement: any, tAttrs: any, transclude: any) => {
                return $injector.invoke(ddo.compile, null, {
                    element: tElement,
                    attributes: tAttrs,
                    transclude: transclude
                });
            }
    }

    if (isFunction(ddo.link)) {
        ddo.link = !hasInjectAnnotation(ddo.link) ? ddo.link :
            (scope: any, iElement: any, iAttrs: any, controllers: any, transclude: any) => {
                return $injector.invoke(<any> ddo.link, null, {
                    scope: scope,
                    element: iElement,
                    attributes: iAttrs,
                    controller: controllers,
                    transclude: transclude
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

    var factory = bind(['$injector'], function directiveFactory($injector: ng.auto.IInjectorService): ng.IDirective {
        return <any> inFactory(ddo, $injector);
    });

    return {
        name: ddo.imperativeName,
        factory: factory
    };

}