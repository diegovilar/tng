import {makeDecorator, FunctionReturningSomething, setIfInterface} from '../utils';

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
 * @internal
 */
export class ServiceDecoratorAnnotation {

    name: string = '';

    constructor(options: ServiceDecoratorOptions) {
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
 * @internal
 */
export interface DecoratorConstructor extends Function {
    new (...args: any[]): ServiceDecorator;
    prototype: ServiceDecorator;
}

type DecoratorSignature = (options: ServiceDecoratorOptions) => ClassDecorator;

/**
 * A decorator to annotate a class as being a service decorator
 */
export var ServiceDecorator = <DecoratorSignature> makeDecorator(ServiceDecoratorAnnotation);