/// <reference path="./_references" />

import {setIfInterface} from './utils';
import {setAnnotations, getAnnotations} from './reflection';

/**
 * A framework envelope for the constant
 */
export class ConstantWrapper {

}

/**
 * Wraps a constant to be made available for dependency injection
 * 
 * @param name The name of the constant through which it will made available
 * @param constant The constant to be injected, as is
 * 
 * @return A wrapper, to be used as a module dependency
 */
export function Constant(name: string, constant: any): ConstantWrapper {

    var wrapper = new ConstantWrapper();

    setAnnotations(wrapper, [new ConstantAnnotation<any>({
        name: name,
        constant: constant
    })], 'value');

    return wrapper;

}

/**
 * @internal
 */
export interface ConstantOptions {
    name: string;
    constant: any;
}

/**
 * @internal
 */
export class ConstantAnnotation<Type> {

    name = '';
    constant: Type = null;

    constructor(options: ConstantOptions) {
        setIfInterface(this, options);
    }

}

/**
 * @internal
 */
export function publishConstant(constant: ConstantWrapper, ngModule: ng.IModule, name?:string):ng.IModule {

    var aux = getAnnotations(constant, ConstantAnnotation, 'value');

    if (!aux.length) {
        throw new Error("Constant annotation not found");
    }

    var annotation = <ConstantAnnotation<any>> aux[0];
    name = name != null ? name : annotation.name;
    ngModule.constant(name, annotation.constant);
    
    return ngModule;

}

// TODO rename registerConstant to publishConstant on consumers
export {publishConstant as registerConstant}