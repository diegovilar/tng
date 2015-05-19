import {makeDecorator, FunctionReturningSomething, setIfInterface} from '../utils';

export interface ServiceOptions {
    name: string;
    provider?: ng.IServiceProvider|ng.IServiceProviderClass;
    factory?: FunctionReturningSomething;
}

// @internal
export class ServiceAnnotation {

    name = '';
    provider: ng.IServiceProvider|ng.IServiceProviderClass = null;
    factory: FunctionReturningSomething = null;

    constructor(options: ServiceOptions) {
        setIfInterface(this, options);
    }

}

export interface Service {

}

export interface ServiceConstructor extends Function {

}

type ServiceSignature = (options: ServiceOptions) => ClassDecorator;
export var Service = <ServiceSignature> makeDecorator(ServiceAnnotation);