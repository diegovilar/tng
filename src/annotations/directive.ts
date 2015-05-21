import {Inject, bind, hasInjectAnnotation} from './di';
import {makeDecorator, Map, setIfInterface, merge, create, isFunction} from '../utils';
import {FunctionReturningString, FunctionReturningNothing, parseSelector, SelectorType} from '../utils';
import {getAnnotations} from '../reflection';

/**
 * 
 */
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

/**
 * 
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

    selector = '';
    scope: boolean|Map<string> = false;
    bind: boolean|Map<string> = false;
    require: string[] = null;
    transclude = Transclusion.Content;
    compile: CompileFunction|FunctionReturningPrePost = null;
    link: FunctionReturningNothing|PrePost = null;

    constructor(options: CommonDirectiveAnnotation) {
        setIfInterface(this, options);
    }

}

/**
 * 
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

    multiElement = false;
    priority = 0;
    terminal = false;

    constructor(options: DirectiveOptions) {
        super(<any> options); // TODO WTF needs casting?
        setIfInterface(this, options);
    }

}

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

/**
 * @internal
 */
//export interface DirectiveDefinitionObject extends ng.IDirective { // bindToController incompatible with angular.d.ts
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
export function makeDirectiveDO(directiveClass: DirectiveConstructor): DirectiveDefinitionObject {
    
    var directive = merge(create(DirectiveAnnotation), getAnnotations(directiveClass, DirectiveAnnotation));

    var selectorData = parseSelector(directive.selector);
    var ddo: DirectiveDefinitionObject = {
        semanticName: selectorData.semanticeName,
        imperativeName: selectorData.imperativeName,        
        restrict: RESTRICTION_MAP[selectorData.type],
        controller: directiveClass,
        multiElement: directive.multiElement,
        priority: directive.priority,
        terminal: directive.terminal,
    };    
    
    if (directive.scope) ddo.scope = directive.scope;
    if (directive.bind) ddo.bindToController = directive.bind;
    if (directive.transclude) ddo.transclude = TRANSCLUSION_MAP[directive.transclude];
    if (directive.compile) ddo.compile = directive.compile;
    if (directive.link) ddo.link = directive.link;
    
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

/**
 * @internal
 */
export function registerDirective(directiveClass: DirectiveConstructor, ngModule: ng.IModule) {

    var aux = getAnnotations(directiveClass, DirectiveAnnotation);

    if (!aux.length) {
        throw new Error("Directive annotation not found");
    }

    var {name, factory} = makeDirectiveFactory(directiveClass);
    ngModule.directive(name, factory);

}