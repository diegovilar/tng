import {setIfInterface} from '../utils';
import {setAnnotations} from '../reflection';

export function Value<Type>(name: string, value: Type): Value {

    var wrapper = {};

    setAnnotations(wrapper, [new ValueAnnotation<Type>({
        name: name,
        value: value
    })], 'value');

    return wrapper;

}

export interface ValueOptions {
    name: string;
    value: any;
}

export class ValueAnnotation<Type> {

    name = '';
    value: Type = null;

    constructor(options: ValueOptions) {
        setIfInterface(this, options);
    }

}

export interface Value {


}