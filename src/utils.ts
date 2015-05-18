/// <reference path="./_references" />

import {Reflect, getAnnotations, addAnnotations} from './reflection';

type extendSignature = <T>(dest: T, ...args: any[]) => T;

export var isDefined = angular.isDefined;
export var isString = angular.isString;
export var isNumber = angular.isNumber;
export var isObject = angular.isObject;
export var isElement = angular.isElement;
export var isDate = angular.isDate;
export var isArray = angular.isArray;
export var isFunction = angular.isFunction;
export var extend = <extendSignature> angular.extend;
export var copy = <extendSignature> angular.copy;
export var merge = <extendSignature> (<any> angular).merge;

export type FunctionReturningNothing = (...args: any[]) => void;
export type FunctionReturningSomething = (...args: any[]) => string;
export type FunctionReturningString = (...args: any[]) => string;
export type FunctionReturningNumber = (...args: any[]) => number;

export interface Map<TValue> {
    [key: string]: TValue;
}

export function create<T>(constructor: { prototype: T }): T {

    return Object.create(constructor.prototype);

}

export function setIf(target:any, source:any) {
    
    if (target == null || source == null) {
        return;
    }
	
	for (let key in source) if (source.hasOwnProperty(key)) {
        target[key] = source[key];
    }
	
}

export function setIfInterface(target:any, source:any) {
    
    if (target == null || source == null) {
        return;
    }
	
	for (let key in source) if (source.hasOwnProperty(key)) {
        if (target.hasOwnProperty(key)) {
            target[key] = source[key];
        }
    }
	
}

export function makeDecorator<T extends Function>(annotationClass: T) {

    return function() {

        var annotationInstance = Object.create(annotationClass.prototype);
        annotationClass.apply(annotationInstance, arguments);

        return function(target: T) {
            addAnnotations(target, annotationInstance);
            return target;
        }

    }

}

export function makeParamDecorator<T extends Function>(annotationClass: T) {

    return function() {

        var annotationInstance = Object.create(annotationClass.prototype);
        annotationClass.apply(annotationInstance, arguments);

        return function(target: T, unusedKey: string, index: number) {

            var parameters = Reflect.getMetadata('parameters', target);
            parameters = parameters || [];
    
            // there might be gaps if some in between parameters do not have annotations.
            // we pad with nulls.
            while (parameters.length <= index) {
                parameters.push(null);
            }

            parameters[index] = annotationInstance;
            Reflect.defineMetadata('parameters', parameters, target);
            return target;

        }

    }

}
