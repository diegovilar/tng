/// <reference path="../typings/angularjs/angular.d.ts" />

declare module "tng" {
	export {Inject, bind} from "tng/di";
	export {Value} from "tng/value";
	export {Constant} from "tng/constant";
	export {Filter} from "tng/filter";
	export {Animation} from "tng/animation";
	export {Service} from "tng/service";
	export {Decorator} from "tng/decorator";
	export {View} from "tng/view";
	export {ComponentView, ComponentTemplateNamespace} from "tng/component-view";
	export {Directive, Transclusion} from "tng/directive";
	export {Component} from "tng/component";
	export {Module, publishModule} from "tng/module";
	export {Application} from "tng/application";
	export {bootstrap} from "tng/bootstrap";
}

declare module "tng/di" {
	
	/**
	 * Annotates a function with information of dependencies to be injected as parameters
	 * 
	 * * Overrides previous annotation (logs warning)
	 * * All parameters should be annotated (logs warning)
	 * * Dependencies will be injected in the order they are specified in the dependencies parameter
	 * 
	 * @param dependencies Names of the dependencies to be injected, in order
	 * @returns The provided function
	 */
	export function bind<T extends Function>(dependencies: string[], func: T): T;

	/**
	 * A decorator to annotate method parameterss with dependencies to be injected
	 *
	 * * Overrides previous annotation (logs warning)
	 * * All parameters should be annotated (logs warning)
	 * 
	 * @param dependency The name of the dependency to be injected
	 */
	export function Inject(dependency: string): ParameterDecorator;

}

declare module "tng/value" {
	
	/**
	 * A framework envelope for the value
	 */
	export interface ValueWrapper {

	}
	
	/**
	 * Wraps a value to be made available for dependency injection
	 * 
	 * @param name The name of the value through which it will made available
	 * @param value The value to be injected, as is
	 * 
	 * @return A wrapper, to be used as a module dependency
	 */
	export function Value(name: string, value: any): ValueWrapper;

}

declare module "tng/constant" {
	
	/**
	 * A framework envelope for the constant
	 */
	export interface ConstantWrapper {

	}
	
	/**
	 * Wraps a constant to be made available for dependency injection
	 * 
	 * @param name The name of the constant through which it will made available
	 * @param constant The constant to be injected, as is
	 * 
	 * @return A wrapper, to be used as a module dependency
	 */
	export function Constant(name: string, constant: any): ConstantWrapper;

}

declare module "tng/filter" {
	
	/**
	 * Options available when decorating a class as a filter
	 */
	export interface FilterOptions {
	    
	    /**
	     * The name with which the filter will be invoked in templates
	     * 
	     * Must be valid angular Expressions identifiers, such as "uppercase",
	     * "upperCase" or "upper_case". Special charaters such as hyphens and dots
	     * are not allowed.
	     * 
	     * To get a hold of the filter delegate through dependency injection,
	     * ask the injector for this name plus the suffix "Filter". 
	     */
	    name: string;
	
	}

	/**
	 * Interface filter classes MUST implement
	 * 
	 * * It's a singleton, instantiated the first time it is needed
	 * * The constructor can receive dependency injections
	 * * When asked for, what is provided is actually the method filter() bound the filter instance
	 */
	export interface Filter {
	    
	    /**
	     * The method that does the actual filtering
	     * 
	     * When asked for, what is provided is actually this method
	     * bound the it's instance
	     * 
	     * * Cannot receive dependency injections for performance reasons (use the constructor)
	     */
	    filter(input: any, ...rest: any[]): any;
	
	}

	/**
	 * A decorator to annotate a class as being a filter
	 */
	function Filter(options: FilterOptions): ClassDecorator;
	
}

declare module "tng/animation" {
	
	type endFunction = (isCancelled: boolean) => void;
	
	/**
	 * Options available when decorating a class as an animation controller
	 * TODO document
	 */
	export interface AnimationOptions {
	    
	    /**
	     * TODO rules?
	     */
	    name: string;
	}
	
	/**
	 * Interface animation controllers MAY implement
	 * TODO document
	 */
	export interface Animation {
	    enter?: (element: ng.IAugmentedJQuery, done: Function) => endFunction;
	    leave?: (element: ng.IAugmentedJQuery, done: Function) => endFunction;
	    move?: (element: ng.IAugmentedJQuery, done: Function) => endFunction;
	    addClass?: (element: ng.IAugmentedJQuery, className: string, done: Function) => endFunction;
	    removeClass?: (element: ng.IAugmentedJQuery, className: string, done: Function) => endFunction;
	}

	/**
	 * A decorator to annotate a class as being an animation controller
	 */
	function Animation(options: AnimationOptions): ClassDecorator;
	
}

declare module "tng/service" {
	
	/**
	 * Options available when decorating a class as a service
	 */
	export interface ServiceOptions {
	    /**
	     * The name the service will be made available for injection
	     */
	    name: string;
	    
	    /**
	     * An optional provider object or provider factory
	     */
	    provider?: ng.IServiceProvider|ng.IServiceProviderFactory;
	    
	    /**
	     * An optional service factory
	     */
	    factory?: Function;
	}
	
	/**
	 * Interface services may implement
	 */
	export interface Service {
	
	}
	
	/**
	 * A decorator to annotate a class as being a service
	 */
	function Service(options: ServiceOptions): ClassDecorator;
	
}

declare module "tng/decorator" {
	
	/**
	 * Options available when decorating a class as a decorator
	 */
	export interface DecoratorOptions {
	
	    /**
	     * The name of service to decorate
	     */
	    name: string;
	
	}
	
	/**
	 * Interface decorators MUST implement
	 * 
	 * * It's a singleton, instantiated the first the decorated service is needed
	 * * The constructor can receive dependency injections
	 * * The original service instance is available for injection locally as $delegate 
	 * * When asked for, what is provided is actually the method decorate() bound the decorator instance
	 */
	export interface Decorator {
	   
	    /**
	     * The method that does the actual decoration
	     * 
	     * This method must return the decorated service, as it will be used when
	     * the service is asked for.
	     * 
	     * * Can receive dependency injections
	     * * The original service instance is available for injection locally as $delegate
	     */
	    decorate(...args: any[]): any;
	
	}
	
	/**
	 * A decorator to annotate a class as being a service decorator
	 */
	function Decorator(options: DecoratorOptions): ClassDecorator;
	
}

declare module "tng/view" {
	
	type FunctionReturningString = {(...args: any[]): string};
		
	/**
	 * Options available when decorating a class with view information
	 * TODO document
	 */
	export interface ViewOptions {
	    
	    /**
	     * 
	     */
	    controllerAs: string;
	    
	    /**
	     * 
	     */
	    template?: string|FunctionReturningString;
	    
	    /**
	     * 
	     */
	    templateUrl?: string|FunctionReturningString;
	    
	    /**
	     * 
	     */
	    styleUrl?: string;
	        
	}

	/**
	 * A decorator to annotate a controller with view information
	 */
	function View(options: ViewOptions): ClassDecorator;
	
}

declare module "tng/component-view" {
	
	import {ViewOptions} from 'tng/view';
	
	/**
	 * TODO document
	 */
	export const enum ComponentTemplateNamespace {
	    HTML,
	    SVG,
	    MathML
	}
		
	/**
	 * Options available when decorating a component with view information
	 * TODO document
	 */
	export interface ComponentViewOptions extends ViewOptions {
	    
	    /**
	     * 
	     */
	    namespace?: ComponentTemplateNamespace;
	    
	    /**
	     * @deprecated
	     */
	    replace?: boolean;
	}

	/**
	 * A decorator to annotate a component with view information
	 */
	function ComponentView(options: ComponentViewOptions): ClassDecorator;
	
}

declare module "tng/directive" {
	
	type StringMap = {[key: string]: string};
	type FunctionReturningNothing = (...args: any[]) => void;
	type PrePost = {
	    pre: FunctionReturningNothing,
	    post: FunctionReturningNothing
	};
	type FunctionReturningPrePost = (...args: any[]) => PrePost;
	type CompileFunction = (...args: any[]) => FunctionReturningNothing;
	
	/**
	 * TODO document
	 */
	export const enum Transclusion {
	    Content,
	    Element
	}
	
	/**
	 * TODO document
	 */
	export interface CommonDirectiveOptions {
	    selector: string;
	    scope?: boolean|StringMap;
	    bind?: boolean|StringMap;
	    require?: string[];
	    transclude?: Transclusion;
	    compile?: CompileFunction|FunctionReturningPrePost;
	    link?: FunctionReturningNothing|PrePost;
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
	 * TODO document
	 */
	export interface Directive {
	
	}
	
	/**
	 * A decorator to annotate a class as being a directive controller
	 */
	function Directive(options: DirectiveOptions): ClassDecorator;
	
}

declare module "tng/component" {
	
	import {Directive, CommonDirectiveOptions} from "tng/directive";
	
	/**
	 * TODO document
	 */
	export interface ComponentOptions extends CommonDirectiveOptions {
	
	}
	
	/**
	 * Interface components MAY implement
	 */
	export interface Component extends Directive {
	
	}
	
	/**
	 * A decorator to annotate a class as being a component controller
	 */
	function Component(options: ComponentOptions): ClassDecorator;
	
}



declare module "tng/module" {
	
	/**
	 * Options available when decorating a class as a module
	 * TODO document
	 */
	export interface ModuleOptions {
		dependencies?: (string|Function)[];
		config?: Function|Function[];
		run?: Function|Function[];
	
		name?: string;
		modules?: (string|Function)[];
		components?: Function[];
		services?: Function[];
		filters?: Function[];
		decorators?: Function[];
		animations?: Function[];
		values?: Function[];
		constants?: Function[];
	}

	/**
	 * A decorator to annotate a class as being a module
	 */
	function Module(options?: ModuleOptions): ClassDecorator;
	
	/**
	 * Interface modules MAY implement
	 * TODO document
	 */
	export interface Module {
		onConfig?: {(...args: any[]): void};
		onRun?: {(...args: any[]): void};
	}
	
	/**
	 * Publishe a TNG module, registering it and its dependencies on Angular.
	 */
	export function publishModule(moduleController: Function, name?: string): ng.IModule;
		
}

declare module "tng/application" {
	
	import {ModuleOptions, Module} from "tng/module";
	
	/**
	 * Options available when decorating a class as an application
	 * TODO document
	 */
	export interface ApplicationOptions extends ModuleOptions {
		selector: string;
	}
	
	/**
	 * Interface applications MAY implement
	 */
	export interface Application extends Module {
	
	}
	
	/**
	 * decorator to annotate a class as being an application
	 */
	function Application(options: ApplicationOptions): ClassDecorator;
	
}

declare module "tng/bootstrap" {
	
	/**
	 * TODO document
	 */
	export function bootstrap(applicationClass: Function): ng.auto.IInjectorService;
	
	/**
	 * TODO document
	 */
	export function bootstrap(moduleClass: Function, element: Element): ng.auto.IInjectorService;
	
	/**
	 * TODO document
	 */
	export function bootstrap(moduleClass: Function, selector: string): ng.auto.IInjectorService;
	
}



// ----------------------------------------------------------------------------

// UI-Router

declare module "tng/ui-router" {
	
	export {States, StateConfig} from "tng/ui-router/states";
	export {Routes} from "tng/ui-router/routes";
	
}

declare module "tng/ui-router/states" {
	
	type StateConfigMap = {[name:string]:StateConfig};
	
	/**
	 * Options available when decorating an application controller with states
	 * TODO document
	 */
	export interface StateConfig {
	    path: string;
	    abstract?: boolean;
	    view?: Function;
	    views?: {[outlet:string]: Function};
	    parent?: StateConfig|string;
	}
	
	/**
	 * A decorator to annotate a class with states
	 */
	function States(states: StateConfigMap): ClassDecorator;
	
}

declare module "tng/ui-router/routes" {
	
	type RoutesMap = {[route:string]:string|Function};
	
	/**
	 * A decorator to annotate with routes
	 */
	function Routes(routes: RoutesMap): ClassDecorator;
	
}