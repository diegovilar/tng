/// <reference path="./_references" />

import {getAnnotations} from './reflection';
import {makeDecorator, setIfInterface, merge, create, isFunction} from './utils';

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
 * @internal
 */
export class ServiceAnnotation {

    name = '';
    provider: ng.IServiceProvider|ng.IServiceProviderFactory = null;
    factory: Function = null;

    constructor(options: ServiceOptions) {
        setIfInterface(this, options);
    }

}

/**
 * Interface services may implement
 */
export interface Service {

}

/**
 * @internal
 */
export interface ServiceConstructor extends Function {
    new (...args: any[]): Service;
    prototype: Service;
}

type DecoratorSignature = (options: ServiceOptions) => ClassDecorator;

/**
 * A decorator to annotate a class as being a service
 */
export var Service = <DecoratorSignature> makeDecorator(ServiceAnnotation);

/**
 * @internal
 */
export function registerService(serviceClass: ServiceConstructor, ngModule: ng.IModule) {

    var aux = getAnnotations(serviceClass, ServiceAnnotation);

    if (!aux.length) {
        throw new Error("Service annotation not found");
    }

    var annotation = merge(create(ServiceAnnotation), ...aux);
    var name = annotation.name;

    if (annotation.provider) {
        ngModule.provider(name, <any> annotation.provider);
    }
    else if (isFunction(annotation.factory)) {
        ngModule.factory(name, annotation.factory);
    }
    else {
        // TODO Is it invoked later with $injector.invoke()?
        ngModule.service(name, serviceClass);
    }

}