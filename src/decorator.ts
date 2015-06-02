/// <reference path="./_references" />

import {bind} from './di';
import {getAnnotations, mergeAnnotations} from './reflection';
import {makeDecorator, setIfInterface, create, isFunction} from './utils';

/**
 * Options available when decorating a class as a service decorator
 */
export interface DecoratorOptions {

    /**
     * The name of service to decorate
     */
    name: string;

}

/**
 * @internal
 */
export class DecoratorAnnotation {

    name: string = null;

    constructor(options: DecoratorOptions) {
        setIfInterface(this, options);
    }

}

/**
 * Interface service decorators MUST implement
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
 * @internal
 */
export interface DecoratorConstructor extends Function {
    new (...args: any[]): Decorator;
    prototype: Decorator;
}

type DecoratorSignature = (options: DecoratorOptions) => ClassDecorator;

/**
 * A decorator to annotate a class as being a service decorator
 */
export var Decorator = <DecoratorSignature> makeDecorator(DecoratorAnnotation);

export function publishDecorator(decoratorClass: DecoratorConstructor, ngModule: ng.IModule, name?: string): ng.IModule {

    // Reflect.decorate apply decorators reversely, so we need to reverse
    // the extracted annotations before merging them
    var aux = getAnnotations(decoratorClass, DecoratorAnnotation).reverse();

    if (!aux.length) {
        throw new Error("Decorator annotation not found");
    }

    var annotation = <DecoratorAnnotation> mergeAnnotations(create(DecoratorAnnotation), ...aux);
    name = name != null ? name : annotation.name;

    if (!isFunction(decoratorClass.prototype.decorate)) {
        throw new Error(`Decorator "${name}" does not implement a decorate method`);
    }

    ngModule.config(bind(['$provide'], function($provide: ng.auto.IProvideService) {
        $provide.decorator(name, bind(['$delegate', '$injector'], function($delegate: any, $injector: ng.auto.IInjectorService) {

            var instance = <Decorator> $injector.instantiate(decoratorClass, {
                $delegate: $delegate
            });

            return $injector.invoke(instance.decorate, instance, {
                $delegate: $delegate
            });

        }));
    }));
    
    return ngModule;

}