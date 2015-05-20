import {setIfInterface} from '../utils';
import {setAnnotations} from '../reflection';

/**
 * A framework envelope for the value
 */
export interface ValueWrapper {	

}

/**
 * Wraps a value to be made available for dependency injection
 * 
 * @param name The name of the value through which it will made available
 * @param value The value to be injected, as is
 * 
 * @return A wrapper instance, to be used as a module dependency
 */
export function Value(name: string, value: any): ValueWrapper {

    var wrapper: ValueWrapper = {};

    setAnnotations(wrapper, [new ValueAnnotation<any>({
        name: name,
        value: value
    })], 'value');

    return wrapper;

}

/**
 * @internal
 */
export interface ValueOptions {
    name: string;
    value: any;
}

/**
 * @internal
 */
export class ValueAnnotation<Type> {

    name = '';
    value: Type = null;

    constructor(options: ValueOptions) {
        setIfInterface(this, options);
    }

}