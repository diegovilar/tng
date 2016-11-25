// TODO debug only?
import {assert} from './assert';

/**
 * A framework envelope for constants
 */
export class ConstantWrapper<Type> {

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
 * Wraps a constant to be made available for dependency injection
 *
 * @param name The name of the constant through which it will made available
 * @param value The constant value to be injected, as is
 *
 * @return A wrapper, to be used as a module dependency
 */
export function Constant<Type>(name: string, value: Type): ConstantWrapper<Type> {

    // TODO debug only?
    assert.notEmpty(name, 'name cannot be null or empty');

    return new ConstantWrapper(name, value);

}

export function publishConstant<Type>(constant: ConstantWrapper<Type>, ngModule: ng.IModule, name?: string): ng.IModule {

    // TODO debug only?
    assert(constant instanceof ConstantWrapper, 'constant must be a ConstantWrapper');

    name = name != null ? name : constant.name;
    ngModule.constant(name, constant.value);

    return ngModule;

}