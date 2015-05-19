import {Inject, hasInjectAnnotation} from './inject';
import {makeDecorator, Map, setIfInterface, merge, create, isFunction} from '../utils';
import {FunctionReturningString, FunctionReturningNothing, parseSelector, SelectorType} from '../utils';
import {getAnnotations} from '../reflection';
import {ViewAnnotation} from './view';

const RESTRICTION_MAP: Map<string> = {
    [SelectorType.Attribute]: 'A',
    [SelectorType.Tag]: 'E',
    [SelectorType.Class]: 'C'
    //[SelectorType.Comment]: 'M'
};

export const enum Transclusion {
    Content,
    Element
};
const TRANSCLUSION_MAP = [true, 'element'];

type PrePost = {
    pre: FunctionReturningNothing,
    post: FunctionReturningNothing
};
type CompileFunction = (...args: any[]) => FunctionReturningNothing;
type FunctionReturningPrePost = (...args: any[]) => PrePost;

export interface ComponentOptions {

    // name = element
    // .name = class
    // [name] = attribute
    // //name = comment (unavailable)
    selector: string;

    multiElement?: boolean;
    priority?: number;
    terminal?: boolean;
    
    // TODO Como simplificar
    // TODO depende de controllerAs?
    // TODO como realmente funciona bindToController no 1.4? Nas docs,
    //      ainda esta como boolean apenas, mas parece que pode ser um Map
    scope?: boolean|Map<string>;
    bindToController?: boolean|Map<string>;

    require?: string[];
    
    // TODO inferir pelo seletor
    // needs mapping
    //restrict?: Restriction|Restriction[]; // [Restriction.Element, Restriction.Element]
    
    // needs mapping
    transclude?: Transclusion; // Transclusion.Content
        
    compile?: CompileFunction|FunctionReturningPrePost;
    link?: FunctionReturningNothing|PrePost;
    
    // @deprecated
    replace?: boolean;

}

// @internal
export class ComponentAnnotation {

    selector = '';
    multiElement = false;
    priority = 0;
    terminal = false;
    scope: boolean|Map<string> = false;
    bindToController: boolean|Map<string> = false;
    require: string[] = null;
    transclude = Transclusion.Content;
    compile: CompileFunction|FunctionReturningPrePost = null;
    link: FunctionReturningNothing|PrePost = null;
    
    // @deprecated
    replace = false;

    constructor(options: ComponentOptions) {
        setIfInterface(this, options);
    }

}

export interface Component {

}

export interface ComponentConstructor extends Function {
    new (): Component;
}

type ComponentDecorator = (options: ComponentOptions) => ClassDecorator;
export var Component = <ComponentDecorator> makeDecorator(ComponentAnnotation);

interface DDO {
    multiElement?: boolean;
    compile?: CompileFunction|FunctionReturningPrePost;
    controller?: any;
    controllerAs?: string;
    bindToController?: boolean|Map<string>;
    link?: FunctionReturningNothing|PrePost;
    name?: string;
    priority?: number;
    replace?: boolean;
    require?: string[];
    restrict?: string;
    scope?: boolean|Map<string>;
    template?: string|FunctionReturningString;
    templateUrl?: string|FunctionReturningString;
    terminal?: boolean;
    transclude?: boolean|string;
}

// @internal
export function makeDirectiveFactory(ComponentClass: ComponentConstructor) {

    var view = merge(create(ViewAnnotation), getAnnotations(ComponentClass, ViewAnnotation));
    var comp = merge(create(ComponentAnnotation), getAnnotations(ComponentClass, ComponentAnnotation));

    // From Component
    var {name, type} = parseSelector(comp.selector);
    var ddo: DDO = {
        restrict: RESTRICTION_MAP[type],
        controller: ComponentClass,
        multiElement: comp.multiElement,
        priority: comp.priority,
        terminal: comp.terminal,
        replace: comp.replace
    };    
    
    if (comp.scope) ddo.scope = comp.scope;
    if (comp.bindToController) ddo.bindToController = comp.bindToController;
    if (comp.transclude) ddo.transclude = TRANSCLUSION_MAP[comp.transclude];
    if (comp.compile) ddo.compile = comp.compile;
    if (comp.link) ddo.link = comp.link;
    
    // From View
    if (view.controllerAs) ddo.controllerAs = view.controllerAs;
    if (view.template) ddo.template = view.template;
    if (view.templateUrl) ddo.templateUrl = view.templateUrl;
    // TODO style
    // TODO styleUrl
    
    var factory = Inject(['$injector'], function directiveFactory($injector: ng.auto.IInjectorService): ng.IDirective {

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

        if (isFunction(ddo.template)) {
            ddo.template = !hasInjectAnnotation(ddo.template) ? ddo.template : (tElement: any, tAttrs: any) => {
                return $injector.invoke(<any> ddo.template, null, {
                    element: tElement,
                    attributes: tAttrs
                });
            };
        }

        if (isFunction(ddo.templateUrl)) {
            ddo.templateUrl = !hasInjectAnnotation(ddo.templateUrl) ? ddo.templateUrl : (tElement: any, tAttrs: any) => {
                return $injector.invoke(<any> ddo.templateUrl, null, {
                    element: tElement,
                    attributes: tAttrs
                });
            };
        }

        return <any> ddo;

    });

    return {
        name: name,
        factory: factory
    };

}