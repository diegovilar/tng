// Type definitions for TNG-JS
// Project: http://github.com/diegovilar/tangular
// Definitions by: Diego Vilar <http://github.com/diegovilar>

declare module "tangular" {

	export {Inject, injectable} from "tangular/di"
	export {Value} from "tangular/value"
	export {Constant} from "tangular/constant"
	export {Filter} from "tangular/filter"
	export {Animation} from "tangular/animation"
	export {Service} from "tangular/service"
	export {Decorator} from "tangular/decorator"
	export {View} from "tangular/view"
	export {ComponentView, ComponentTemplateNamespace} from "tangular/component-view"
	export {Directive, Transclusion, Bind} from "tangular/directive"
	export {Component} from "tangular/component"
	export {Module, publishModule} from "tangular/module"
	export {Application} from "tangular/application"
	export {bootstrap} from "tangular/bootstrap"

}

declare module "tangular/di" {

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
	export function injectable<T extends Function>(dependencies: string[], func: T): T;

	/**
	* Binds a function to a context and preservers it's annotated dependencies
	*
	* @param func The function to be bound
	* @param context The object to which bind the funcion
	* @returns A bound function
	*/
	export function safeBind<T extends Function>(func: T, context: any): T;

	/**
	 * A decorator to annotate method parameterss with dependencies to be injected
	 *
	 * * Overrides previous annotation (logs warning)
	 * * All parameters should be annotated (logs warning)
	 *
	 * @param dependency The name of the dependency to be injected
	 */
	export function Inject(dependency: string): ParameterDecorator;

	/**
	 * Inspects a function for dependency injection annotation
	 *
	 * @param func The object to be inspected
	 */
	export function isAnnotated(func: Function): boolean;

}

declare module "tangular/value" {

	/**
	 * A framework envelope for values
	 */
	export class ValueWrapper<Type> {
		name: string;
		value: Type;
	}

	/**
	 * Wraps a value to be made available for dependency injection
	 *
	 * @param name The name of the value through which it will made available
	 * @param value The value to be injected, as is
	 *
	 * @return A wrapper, to be used as a module dependency
	 */
	export function Value<Type>(name: string, value: Type): ValueWrapper<Type>;

	export function publishValue<Type>(value: ValueWrapper<Type>, ngModule: ng.IModule, name?: string): ng.IModule;

}

declare module "tangular/constant" {

	/**
	 * A framework envelope for constants
	 */
	export class ConstantWrapper<Type> {
		name: string;
		value: Type;
	}

	/**
	 * Wraps a constant to be made available for dependency injection
	 *
	 * @param name The name of the constant through which it will made available
	 * @param value The constant value to be injected, as is
	 *
	 * @return A wrapper, to be used as a module dependency
	 */
	export function Constant<Type>(name: string, value: Type): ConstantWrapper<Type>;

	export function publishConstant<Type>(constant: ConstantWrapper<Type>, ngModule: ng.IModule, name?: string): ng.IModule;

}

declare module "tangular/filter" {

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

		stateful?: boolean;

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

declare module "tangular/animation" {

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

declare module "tangular/service" {

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

	/**
	 * @internal
	 */
	export class ServiceAnnotation {

	    name: string;
	    provider: ng.IServiceProvider|ng.IServiceProviderFactory;
	    factory: Function;

	    constructor(options: ServiceOptions);

	}

	export function publishService(serviceClass: Function, ngModule: ng.IModule, name?: string): ng.IModule;

}

declare module "tangular/decorator" {

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
	export function Decorator(options: DecoratorOptions): ClassDecorator;

	export function publishDecorator(decoratorClass: Function, ngModule: ng.IModule, name?: string): ng.IModule;

}

declare module "tangular/view" {

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
	    styles?: string|string[];

	    /**
	     *
	     */
	    // stylesUrls?: string[];

	}

	/**
	 * A decorator to annotate a controller with view information
	 */
	function View(options: ViewOptions): ClassDecorator;

}

declare module "tangular/component-view" {

	import {ViewOptions} from "tangular/view";

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

declare module "tangular/directive" {

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
	    bindToController?: boolean;
	    require?: string[];
	    transclude?: Transclusion;
	    compile?: CompileFunction|FunctionReturningPrePost;
	    link?: FunctionReturningNothing|PrePost|string;
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

    /**
     * A decorator to annotate a property as being a binding to the controller
     */
    export let Bind: {

        /**
         * Bind a local scope property to a component's element attribute.
         *
         * @param {string} binding
         * @returns {PropertyDecorator}
         */
        (binding: string): PropertyDecorator;

        /**
         * Bind a local scope property to the value of DOM attribute.
         *
         * The result is always a string since DOM attributes are strings.
         *
         * Equivalent to Bind("@...")
         *
         * @param {string} binding
         * @returns {PropertyDecorator}
         */
        value(binding: string): PropertyDecorator;

        /**
         * Set up a bidirectional binding between a local scope property and an expression passed via the attribute attr.
         *
         * The expression is evaluated in the context of the parent scope.
         *
         * Equivalent to Bind("=...")
         *
         * @param {string} binding
         * @returns {PropertyDecorator}
         */
        reference(binding: string): PropertyDecorator;

        /**
         * Provides a way to execute an expression in the context of the parent scope.
         *
         * Equivalent to Bind("&...")
         *
         * @param {string} binding
         * @returns {PropertyDecorator}
         */
        expression(binding: string): PropertyDecorator;

    }

	export function publishDirective(directiveClass: Function, ngModule: ng.IModule, selector?: string): ng.IModule;

}

declare module "tangular/component" {

	import {Directive, CommonDirectiveOptions} from "tangular/directive";
	export  {Bind} from "tangular/directive";

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

    interface ComponentDecoratorType {
        (options: ComponentOptions): ClassDecorator;
        // extends: any;
    }

	/**
	 * A decorator to annotate a class as being a component controller
	 */
	// function Component(options: ComponentOptions): ClassDecorator;
    export var Component: ComponentDecoratorType;

	export function publishComponent(componentClass: Function, ngModule: ng.IModule, selector?: string): ng.IModule;

}



declare module "tangular/module" {

	import {ConstantWrapper} from "tangular/constant";
	import {ValueWrapper} from "tangular/value";

	export type Dependency = (string|Function|ConstantWrapper<any>|ValueWrapper<any>);
    export type DependenciesArray = (Dependency|Dependency[])[];

	/**
	 * Options available when decorating a class as a module
	 * TODO document
	 */
	export interface ModuleOptions {
		name?: string;
		dependencies?: DependenciesArray;
		config?: Function|Function[];
		run?: Function|Function[];

		// modules?: (string|Function)[];
		// components?: Function[];
		// services?: Function[];
		// filters?: Function[];
		// decorators?: Function[];
		// animations?: Function[];
		// values?: Function[];
		// constants?: Function[];
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
	export function publishModule(moduleController: Function, name?: string,
        dependencies?: DependenciesArray, constructorParameters?: any[]): ng.IModule;

	// -- Internal API

	/**
	 * @internal
	 */
	export class ModuleAnnotation {
		name: string;
		dependencies: DependenciesArray;
		config: Function|Function[];
		run: Function|Function[];

		// modules: (string|Function)[];
		// components: Function[];
		// services: Function[];
		// filters: Function[];
		// decorators: Function[];
		// animations: Function[];
		// values: Function[];
		// constants: Function[];

		constructor(options?: ModuleOptions);

	}

}

declare module "tangular/application" {

	import {ModuleOptions, Module} from "tangular/module";

	/**
	 * Options available when decorating a class as an application
	 * TODO document
	 */
	export interface ApplicationOptions extends ModuleOptions {
		element: Element|Document;
	}

	/**
	 * Interface applications MAY implement
	 */
	export interface Application extends Module {

	}

	/**
	 * decorator to annotate a class as being an application
	 */
	function Application(element: Element|Document): ClassDecorator;
	function Application(options: ApplicationOptions): ClassDecorator;

}

declare module "tangular/bootstrap" {

    import {DependenciesArray} from "tangular/module";

	/**
	 * TODO document
	 */
	export function bootstrap(applicationClass: Function, element?: Element|Document,
        dependencies?: DependenciesArray, constructorParameters?: any[]): ng.auto.IInjectorService;

	/**
	 * TODO document
	 */
	export function bootstrap(moduleClass: Function, element: Element|Document,
        dependencies?: DependenciesArray, constructorParameters?: any[]): ng.auto.IInjectorService;

	/**
	 * TODO document
	 */
	// export function bootstrap(moduleClass: Function, selector: string): ng.auto.IInjectorService;

}

// ----------------------------------------------------------------------------
// UI-Router
// ----------------------------------------------------------------------------

declare module "tangular/ui/router/states" {

    type StateConfigMap = { [stateName: string]: StateConfig };

    export {View, ViewOptions} from "tangular/view";

    /**
     * Enumeration of events related to the transition of states.
     */
    export const enum StateChangeEvent {

        /**
         * Fired when the transition begins.
         *
         * Translates to the UI-Router $stateChangeStart event.
         *
         * The $rootScope broadcasts this event down to child scopes.
         *
         * The handler function receives the following parameters:
         *
         * - event: ng.IAngularEvent
         * - toState:
         * - toParams:
         * - fromState:
         * - fromParams:
         *
         * Note: Use event.preventDefault() to prevent the transition from happening.
         */
        STATE_CHANGE_START,

        /**
         * Fired once the state transition is complete.
         *
         * Translates to the UI-Router $stateChangeSuccess event.
         *
         * The $rootScope broadcasts this event down to child scopes.
         *
         * The handler function receives the following parameters:
         *
         * - event: ng.IAngularEvent
         * - toState:
         * - toParams:
         * - fromState:
         * - fromParams:
         */
        STATE_CHANGE_SUCCESS,

        /**
         * Fired when an error occurs during transition.
         *
         * Translates to the UI-Router $stateChangeError event.
         *
         * The $rootScope broadcasts this event down to child scopes.
         *
         * The handler function receives the following parameters:
         *
         * - event: ng.IAngularEvent
         * - toState:
         * - toParams:
         * - fromState:
         * - fromParams:
         * - error: Error
         *
         * Note: It's important to note that if you have any errors in your
         * resolve functions (JavaScript errors, non-existent services, etc)
         * they will not throw traditionally. You must listen for this
         * event to catch ALL errors. Use event.preventDefault() to prevent
         * the $UrlRouter from reverting the URL to the previous valid location
         * (in case of a URL navigation).
         */
        STATE_CHANGE_ERROR

        /**
         * TODO: From version 0.3.0 and up. Does it have a stable release?
         *
         * Fired when a state cannot be found by its name.
         *
         * Translates to the UI-Router $stateNotFound event.
         *
         * The $rootScope broadcasts this event down to child scopes.
         */
        // STATE_NOT_FOUND

    }

    /**
     * Enumeration of events related to the loading of view contents.
     */
    export const enum ViewLoadEvent {

        /**
         * Fired once the view begins loading, before the DOM is rendered.
         *
         * Translates to the UI-Router $viewContentLoading event.
         *
         * The $rootScope broadcasts this event down to child scopes.
         *
         * The handler function receives the following parameters:
         *
         * - event: ng.IAngularEvent
         * - viewConfig:
         */
        VIEW_CONTENT_LOADING = 4,

        /**
         * Fired once the view is loaded, after the DOM is rendered.
         *
         * Translates to the UI-Router $viewContentLoaded event.
         *
         * The '$scope' of the view emits the event up to the $rootScope.
         *
         * The handler function receives the following parameter:
         *
         * - event: ng.IAngularEvent
         */
        VIEW_CONTENT_LOADED = 5

    }

	/**
	 * Options available when decorating an application controller with states
	 * TODO document
	 */
	export interface StateConfig {
	    url: string;
	    abstract?: boolean;
	    view?: Function;
	    views?: {[outlet: string]: Function};
		modal?: Function;
	    parent?: StateConfig|string;
		reloadOnSearch?: boolean;
		onEnter?: Function;
		onExit?: Function;
		resolve?: {[key: string]: string|Function};
    }

    type StateChangeHandler = (event?: ng.IAngularEvent, toState?: any, toParams?: any, fromState?: any, fromParams?: any) => void;
    type StateChangeErrorHandler = (event?: ng.IAngularEvent, toState?: any, toParams?: any, fromState?: any, fromParams?: any, error?: Error) => void;

    export interface StatesDecorator {
        /**
         * Decorates a module with states.
         */
        (states: StateConfigMap): ClassDecorator;

        /**
         * Add a listener to a given UI-Router emitted events.
         * @param event The event to listen to
         * @param handler The function to invoke when the event is fired
         */
        on(event: StateChangeEvent|ViewLoadEvent|string, handler: Function): ClassDecorator;

        onStateChangeStart(handler: StateChangeHandler): ClassDecorator;
        onStateChangeSuccess(handler: StateChangeHandler): ClassDecorator;
        onStateChangeError(handler: StateChangeErrorHandler): ClassDecorator;
        // onStateChangeNotFound(handler: stateChangeHandler): ClassDecorator;
    }

	/**
	 * A decorator to annotate a class with states
	 */
    export var States: StatesDecorator;

}

declare module "tangular/ui/router/routes" {

	type RoutesMap = {[route: string]: string|Function};

    export interface RoutesDecorator {

        /**
         * Decorates a module with states.
         */
        (routes: RoutesMap): ClassDecorator;

        when(what: string|RegExp|ng.ui.IUrlMatcher, redirect: string): void;
        when(what: string|RegExp|ng.ui.IUrlMatcher, handler: Function): void;

        otherwise(redirect: string): void;
        otherwise(handler: Function): void;

    }

	/**
	 * A decorator to annotate with routes
	 */
	export var Routes: RoutesDecorator;
    // function Routes(routes: RoutesMap): ClassDecorator;

}



// ----------------------------------------------------------------------------
// UI-Bootstrap
// ----------------------------------------------------------------------------

declare module "tangular/ui/bootstrap" {

	export class TngUiBootstrapModule {

    }

}

declare module "tangular/ui/bootstrap/modal" {

    import {ViewOptions} from "tangular/view"
	import IModalScope = angular.ui.bootstrap.IModalScope
	// type StringMap = {[key: string]: string};

	export enum ModalBackdrop {
		Show,
		Hide,
		Static
	}

	/**
	 * Options available when decorating a component with view information
	 * TODO document
	 */
	export interface ModalViewOptions extends ViewOptions {

		animation?: boolean;
		backdrop?: ModalBackdrop;
		backdropClass?: string;
		keyboard?: boolean;
		windowClass?: string;
		windowTemplateUrl?: string;
		size?: string;

	}

	/**
	 * A decorator to annotate a component with view information
	 */
	function ModalView(options: ModalViewOptions): ClassDecorator;

	/**
	 * TODO document
	 */
	export interface ModalOptions {

		scope?: ng.IScope|IModalScope|{(...args: any[]): ng.IScope|IModalScope};
	    bindToController?: boolean; // defautls to true; differs from the original
		// resolve?: {[key: string]: string|Function}; // It doesn't really support strings, as stated in the docs
		resolve?: {[key: string]: Function};
		keyboard?: boolean;
		dismissAll?: boolean;

	}

	/**
	 * Interface components MAY implement
	 */
	export interface Modal {

	}

	/**
	 * A decorator to annotate a class as being a component controller
	 */
	function Modal(options?: ModalOptions): ClassDecorator;

}

declare module angular.ui.bootstrap {

	interface IModalService {
        /**
         * @param {Function} modal
         * @param {ng.IScope|IModalScope} scope
         * @returns {IModalServiceInstance}
         */
        open(modal: Function, scope?: ng.IScope|IModalScope): IModalServiceInstance;
    }

}