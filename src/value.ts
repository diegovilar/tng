/// <reference path="./_references" />

// TODO debug only?
import {assert} from './assert';

/**
 * A framework envelope for values
 */
export class ValueWrapper<Type> {

    constructor(private _name: string, private _value: Type) {
    }
    
    get name() {
        return this._name;
    }
    
    get value() {
        return this._value;
    }
    
}

/**
 * Wraps a value to be made available for dependency injection
 * 
 * @param name The name of the value through which it will made available
 * @param value The value to be injected, as is
 * 
 * @return A wrapper instance, to be used as a module dependency
 */
export function Value<Type>(name: string, value: Type): ValueWrapper<Type> {
    
    // TODO debug only?
    assert.notEmpty(name, 'name cannot be null or empty');

    return new ValueWrapper(name, value);

}

export function publishValue<Type>(value: ValueWrapper<Type>, ngModule: ng.IModule, name?: string): ng.IModule {

    // TODO debug only?
    assert(value instanceof ValueWrapper, 'constant must be a ConstantWrapper');
    
    name = name != null ? name : value.name;
    ngModule.value(name, value.value);
    
    return ngModule;

}