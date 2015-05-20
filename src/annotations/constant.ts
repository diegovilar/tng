import {setIfInterface} from '../utils';
import {setAnnotations} from '../reflection';

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
export function Constant(name: string, constant: any): ConstantWrapper {

    var wrapper: ConstantWrapper = {};

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