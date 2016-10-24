/// <reference path="./_references.ts" />

import {assert} from './assert'
import {Inject, injectable, isAnnotated} from './di'
import {isDefined, isFunction, makeDecorator, Map, setIfInterface} from "./utils";
import {FunctionReturningString, FunctionReturningNothing, parseSelector, SelectorType} from './utils'
import {hasAnnotation, hasOwnAnnotation, getAnnotations, mergeAnnotations, addAnnotation} from './reflection'
import {ViewAnnotation} from './view'
import {ComponentViewAnnotation, NAMESPACE_MAP} from './component-view'
import {CommonDirectiveOptions, CommonDirectiveAnnotation} from './directive'
import {Directive, DirectiveAnnotation, DirectiveConstructor, Transclusion} from './directive'
import {makeCommonDO, DirectiveDefinitionObject, inFactory as inFactoryDirective} from './directive'

export {Bind} from './directive';



/**
 * TODO document
 */
export interface ComponentOptions extends CommonDirectiveOptions {

}

/**
 * @internal
 */
export class ComponentAnnotation extends CommonDirectiveAnnotation {

    constructor(options: ComponentOptions) {
        super(options); // TODO WTF needs casting?
        //setIfInterface(this, options); nothing to do so far
    }

}

/**
 * Interface components MAY implement
 */
export interface Component extends Directive {

}

/**
 * @internal
 */
export interface ComponentConstructor extends DirectiveConstructor {
    new (): Component;
}


/*function componentDecoratorExtensor(baseClass: Function) {

    // debugger;

    var annotations = <ComponentAnnotation[]> getAnnotations(baseClass, ComponentAnnotation);

    return function(target: any) {
        // debugger;
        // TODO clone?
        for (let annotation of annotations) {
            addAnnotation(target, annotation)
        }
        return target;
    }

};*/

interface ComponentDecoratorType {
    (options: ComponentOptions): ClassDecorator;
    // extends: typeof componentDecoratorExtensor;
}

type ComponentDecorator = (options: ComponentOptions) => ClassDecorator;

/**
 * A decorator to annotate a class as being a component controller
 */
export var Component = <ComponentDecoratorType><any> makeDecorator(ComponentAnnotation);

// Component.extends = componentDecoratorExtensor;

/**
 * @internal
 */
export interface ComponentDefinitionObject extends DirectiveDefinitionObject {
    controllerAs?: string;
    template?: string|FunctionReturningString;
    templateUrl?: string|FunctionReturningString;
    styles?: string|string[];
    // stylesUrls?: string[];
    templateNamespace?: string;
}

export function publishComponent(componentClass: ComponentConstructor, ngModule: ng.IModule, selector?: string): ng.IModule {

    // TODO debug only?
    assert(hasOwnAnnotation(componentClass, ComponentAnnotation), 'Missing @Component decoration');
    assert(hasAnnotation(componentClass, ViewAnnotation), 'Missing @View decoration');

    var {name, factory} = makeComponentFactory(componentClass);

    // TODO Allow for selector override through parameter

    ngModule.directive(name, factory);

    return ngModule;

}

/**
 * @internal
 */
export function makeComponentDO(componentClass: ComponentConstructor): ComponentDefinitionObject {

    var cdo = <ComponentDefinitionObject> makeCommonDO(<DirectiveConstructor> componentClass);

    // Reflect.decorate apply decorators reversely, so we need to reverse
    // the extracted annotations before merging them
    // var aux = getAnnotations(componentClass, ViewAnnotation).reverse();
    var aux = getAnnotations(componentClass, ViewAnnotation);
    var view = <ComponentViewAnnotation> {/*no defaults*/};
    mergeAnnotations(view, ...aux);

    if (!isDefined(cdo.scope)) cdo.scope = {}; // Default scope is isolate
    if (!isDefined(cdo.bindToController)) cdo.bindToController = true; // Default bindToController value
    if (isDefined(view.controllerAs)) cdo.controllerAs = view.controllerAs;
    if (isDefined(view.namespace)) cdo.templateNamespace = NAMESPACE_MAP[view.namespace];

    if (isDefined(view.styles)) {
        cdo.styles = typeof view.styles === "string" ? [<string> view.styles] : view.styles;
    }
    // else if (isDefined(view.stylesUrls)) cdo.stylesUrls = view.stylesUrls;

    if (isDefined(view.template)) cdo.template = view.template;
    else if (isDefined(view.templateUrl)) cdo.templateUrl = view.templateUrl;
    else throw new Error('Component has no template. Use either template or templateUrl');

    return cdo;

}

/**
 * @internal
 */
export function inFactory(cdo: ComponentDefinitionObject, $injector: ng.auto.IInjectorService): ComponentDefinitionObject {

    if (isFunction(cdo.template)) {
        cdo.template = !isAnnotated(<any> cdo.template) ? cdo.template : (tElement: any, tAttrs: any) => {
            return $injector.invoke(<any> cdo.template, null, {
                element: tElement,
                attributes: tAttrs
            });
        };
    }

    if (isFunction(cdo.templateUrl)) {
        cdo.templateUrl = !isAnnotated(<any> cdo.templateUrl) ? cdo.templateUrl : (tElement: any, tAttrs: any) => {
            return $injector.invoke(<any> cdo.templateUrl, null, {
                element: tElement,
                attributes: tAttrs
            });
        };
    }

    // TODO styleUrl

    return cdo;

}

/**
 * @internal
 */
export function makeComponentFactory(componentClass: ComponentConstructor) {

    var cdo = makeComponentDO(componentClass);

    var factory = injectable(['$injector'], function directiveFactory($injector: ng.auto.IInjectorService): ng.IDirective {

        if (cdo.styles) {
            for (let i = 0; i < cdo.styles.length; i++) {
                insertStyle(cdo.styles[i], `tng-component_${cdo.imperativeName}_${i}`);
            }
        }
        // else if (cdo.stylesUrls) {
            // TODO
        // }

        return <any> inFactory(inFactoryDirective(cdo, $injector), $injector);
    });

    return {
        name: cdo.imperativeName,
        factory: factory
    };

}

function insertStyle(style: string, id: string) {

    id = `#${id}`;
    let head = document.head;

    if (head.querySelector(id)) {
        return;
    }

    let el = document.createElement("style");
    el.id = id;
    el.type = "text/css"
    el.textContent = style;
    head.insertBefore(el, head.querySelector("style"));

}