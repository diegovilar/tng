/// <reference path="../typings/angularjs/angular.d.ts" />

declare module "tng" {

	export {Inject, bind} from "tng/di";
	export {Value} from "tng/value";
	export {Constant} from "tng/constant";
	export {Filter} from "tng/filter";
	export {Service} from "tng/service";
	export {ServiceDecorator} from "tng/service-decorator";
	
	// todo module, application, component, view, bootstrap

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

declare module "tng/service-decorator" {
	
	/**
	 * Options available when decorating a class as a service decorator
	 */
	export interface ServiceDecoratorOptions {
	
	    /**
	     * The name of service to decorate
	     */
	    name: string;
	
	}
	
	/**
	 * Interface service decorators MUST implement
	 * 
	 * * It's a singleton, instantiated the first the decorated service is needed
	 * * The constructor can receive dependency injections
	 * * The original service instance is available for injection locally as $delegate 
	 * * When asked for, what is provided is actually the method decorate() bound the decorator instance
	 */
	export interface ServiceDecorator {
	   
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
	function ServiceDecorator(options: ServiceDecoratorOptions): ClassDecorator;
	
}