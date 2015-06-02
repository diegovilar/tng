/// <reference path="./_references" />

import {getAnnotations, mergeAnnotations} from './reflection';
import {makeDecorator, setIfInterface, create, isFunction} from './utils';
import {bind} from './di';

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
 * @internal
 */
export class FilterAnnotation {

    name: string = null;

    constructor(options: FilterOptions) {
        setIfInterface(this, options);
    }

}

/**
 * Interface filter classes MUST implement
 * 
 * * It's a singleton, instantiated the first time it is needed
 * * The constructor can receive dependency injections
 * * When asked for, what is provided is actually the method filter() bound the it's instance
 */
export interface Filter {
    
    /**
     * The method that does the actual filtering
     * 
     * When asked for, what is provided is actually this method
     * bound the it's instance
     * 
     * * Cannot receive dependency injections (use the constructor)
     */
    filter(input: any, ...rest: any[]): any;

}

/**
 * @internal
 */
export interface FilterConstructor extends Function {
    new (...args: any[]): Filter;
    prototype: Filter;
}

type DecoratorSignature = (options: FilterOptions) => ClassDecorator;

/**
 * A decorator to annotate a class as being a filter
 */
export var Filter = <DecoratorSignature> makeDecorator(FilterAnnotation);

/**
 * @internal
 */
export function registerFilter(filterClass: FilterConstructor, ngModule: ng.IModule) {

    // Reflect.decorate apply decorators reversely, so we need to reverse
    // the extracted annotations before merging them
    var aux = getAnnotations(filterClass, FilterAnnotation).reverse();

    if (!aux.length) {
        throw new Error("Filter annotation not found");
    }

    var {name} = mergeAnnotations<FilterAnnotation>(create(FilterAnnotation), ...aux);

    if (!isFunction(filterClass.prototype.filter)) {
        throw new Error(`Filter "${name}" does not implement a filter method`);
    }

    ngModule.filter(name, bind(['$injector'], function($injector: ng.auto.IInjectorService) {
        var filterSingleton = <Filter> $injector.instantiate(filterClass);
        return filterSingleton.filter.bind(filterSingleton);
    }));

}