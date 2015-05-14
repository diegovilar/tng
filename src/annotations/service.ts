import {makeDecorator} from '../utils';

interface ServiceOptions {
    name:string;
    provider?:ng.IServiceProvider|ng.IServiceProviderFactory|ng.IServiceProviderClass;
    factory?:Function;
}

class ServiceAnnotation {
    
    name:string;
    provider:ng.IServiceProvider|ng.IServiceProviderFactory|ng.IServiceProviderClass;
    factory:Function;
    
    constructor(options:ServiceOptions) {
        this.name = options.name;
        this.provider = options.provider;
        this.factory = options.factory;
    }
    
}

//interface ServiceConstructorInterface extends Function {
//    provider?:(...args:any[]) => ng.IServiceProvider;
//    factory?:(...args:any[]) => any;
//}

type ServiceAnnotationConstructor = (options:ServiceOptions) => ClassDecorator;
var Service = <ServiceAnnotationConstructor> makeDecorator(ServiceAnnotation);

export {
    ServiceOptions,
    ServiceAnnotation,
    //ServiceConstructorInterface,
    Service
};
