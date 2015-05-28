/// <reference path="./_references" />

import {Inject, bind, hasInjectAnnotation} from './di';
import {makeDecorator, Map, setIfInterface, merge, create, isFunction} from './utils';
import {FunctionReturningString, FunctionReturningNothing, parseSelector, SelectorType} from './utils';
import {getAnnotations} from './reflection';
import {ViewAnnotation} from './view';
import {ComponentViewAnnotation, NAMESPACE_MAP} from './component-view';
import {CommonDirectiveOptions, CommonDirectiveAnnotation} from './directive'
import {Directive, DirectiveAnnotation, DirectiveConstructor, Transclusion} from './directive'
import {makeDirectiveDO, DirectiveDefinitionObject, inFactory as inFactoryDirective} from './directive'

/**
 * TODO document
 */
export interface ComponentOptions extends CommonDirectiveOptions {

}

/**
 * @internal
 */
export class ComponentAnnotation extends CommonDirectiveAnnotation {

    /*constructor(options: ComponentOptions) {
        super(<any> options); // TODO WTF needs casting?
        //setIfInterface(this, options); nothing to do so far
    }*/

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

type ComponentDecorator = (options: ComponentOptions) => ClassDecorator;

/**
 * A decorator to annotate a class as being a component controller
 */
export var Component = <ComponentDecorator> makeDecorator(ComponentAnnotation);

/**
 * @internal
 */
export interface ComponentDefinitionObject extends DirectiveDefinitionObject {
    controllerAs?: string;
    template?: string|FunctionReturningString;
    templateUrl?: string|FunctionReturningString;
    templateNamespace?: string;
}

/**
 * @internal
 */
export function registerComponent(componentClass: ComponentConstructor, ngModule: ng.IModule) {

    var aux = getAnnotations(componentClass, ComponentAnnotation);

    if (!aux.length) {
        throw new Error("Component annotation not found");
    }

    var {name, factory} = makeComponentFactory(componentClass);
    ngModule.directive(name, factory);
    
}

/**
 * @internal
 */
export function makeComponentDO(componentClass: ComponentConstructor): ComponentDefinitionObject {

    var cdo = <ComponentDefinitionObject> makeDirectiveDO(<DirectiveConstructor> componentClass);

    // var component = merge(create(ComponentAnnotation), ...getAnnotations(componentClass, ComponentAnnotation));
    var template = merge(create(ComponentViewAnnotation), ...getAnnotations(componentClass, ComponentViewAnnotation));
    
    // TODO Component restrictions
        
    if (template.controllerAs) cdo.controllerAs = template.controllerAs;
    if (template.namespace) cdo.templateNamespace = NAMESPACE_MAP[template.namespace];
    // TODO styleUrl
    
    if (template.template) cdo.template = template.template;
    else if (template.templateUrl) cdo.templateUrl = template.templateUrl;
    else throw new Error('Components must have an inline or remote template');    
        
    return cdo;

}

/**
 * @internal
 */
export function inFactory(cdo: ComponentDefinitionObject, $injector: ng.auto.IInjectorService): ComponentDefinitionObject {

    if (isFunction(cdo.template)) {
        cdo.template = !hasInjectAnnotation(cdo.template) ? cdo.template : (tElement: any, tAttrs: any) => {
            return $injector.invoke(<any> cdo.template, null, {
                element: tElement,
                attributes: tAttrs
            });
        };
    }

    if (isFunction(cdo.templateUrl)) {
        cdo.templateUrl = !hasInjectAnnotation(cdo.templateUrl) ? cdo.templateUrl : (tElement: any, tAttrs: any) => {
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

    var factory = bind(['$injector'], function directiveFactory($injector: ng.auto.IInjectorService): ng.IDirective {
        return <any> inFactory(inFactoryDirective(cdo, $injector), $injector);
    });

    return {
        name: cdo.imperativeName,
        factory: factory
    };

}