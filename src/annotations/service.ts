/// <reference path="../_references" />

/*
@Service({
    name: 'translator'
})
class Translator {

    constructor(@Inject('$scope') private $scope, @Inject('$element') private $element,
                @Inject('$attrs') private $attrs, @Inject('$transclude') private $transclude) {        
    }
    
    static provider():string {
    }
    
    static factory():Translator {
    }

}
*/

import {makeDecorator, FunctionReturningSomething} from '../utils';

export interface ServiceOptions {
    name: string;
    //provider?: ng.IServiceProvider|ng.IServiceProviderFactory|ng.IServiceProviderClass;
    //factory?: FunctionReturningSomething;
}

// @internal
export class ServiceAnnotation {

    name: string;
    //provider: ng.IServiceProvider|ng.IServiceProviderFactory|ng.IServiceProviderClass;
    //factory: Function;

    constructor(options: ServiceOptions) {
        this.name = options.name;
        //this.provider = options.provider;
        //this.factory = options.factory;
    }

}

type ServiceDecorator = (options: ServiceOptions) => ClassDecorator;
export var Service = <ServiceDecorator> makeDecorator(ServiceAnnotation);

// @internal
export interface ServiceClass extends Function {
    provider?: ng.IServiceProviderClass;
    factory?: FunctionReturningSomething;
}
