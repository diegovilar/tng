// TODO debug only?
import {assert} from './assert';

import {makeDecorator, getAnnotations, mergeAnnotations} from './reflection';
import {setIfInterface, isFunction} from './utils';

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

    name: string = void 0;
    provider: ng.IServiceProvider|ng.IServiceProviderFactory = void 0;
    factory: Function = void 0;

    constructor(options: ServiceOptions) {
        // TODO debug only?
        assert.notNull(options, 'options must not be null');
        assert.notEmpty(options.name, 'name cannot be null or empty');

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
export function publishService(serviceClass: ServiceConstructor, ngModule: ng.IModule, name?: string): ng.IModule {

    // Reflect.decorate apply decorators reversely, so we need to reverse
    // the extracted annotations before merging them
    // var aux = getAnnotations(serviceClass, ServiceAnnotation).reverse();
    var aux = getAnnotations(serviceClass, ServiceAnnotation);

    // TODO debug only?
    assert.notEmpty(aux, 'Did you decorate it with @Service?');

    var annotation = <ServiceAnnotation> {/*no defalts*/};
    mergeAnnotations(annotation, ...aux);

    var name = name != null ? name : annotation.name;

    if (annotation.provider) {
        ngModule.provider(name, <any> annotation.provider);
    }
    else if (annotation.factory) {
        ngModule.factory(name, annotation.factory);
    }
    else {
        ngModule.service(name, serviceClass);
    }

    return ngModule;

}