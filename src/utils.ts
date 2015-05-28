/// <reference path="./_references" />

import {Reflect, getAnnotations, addAnnotation} from './reflection';

type extendSignature = <Type>(dest: Type, ...rest: any[]) => Type;

export var isDefined = angular.isDefined;
export var isString = angular.isString;
export var isNumber = angular.isNumber;
export var isObject = angular.isObject;
export var isElement = angular.isElement;
export var isDate = angular.isDate;
export var isArray = angular.isArray;
export var isFunction = angular.isFunction;
export var forEach = angular.forEach;
export var extend = <extendSignature> angular.extend;
export var copy = <extendSignature> angular.copy;
export var merge = <extendSignature> (<any> angular).merge;

export type FunctionReturningNothing = (...args: any[]) => void;
export type FunctionReturningSomething = (...args: any[]) => any;
export type FunctionReturningString = (...args: any[]) => string;
export type FunctionReturningNumber = (...args: any[]) => number;

export interface Map<TValue> {
    [key: string]: TValue;
}

export function create<Type>(constructor: { prototype: Type }): Type {

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
            addAnnotation(target, annotationInstance);
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

export const enum SelectorType {
    Attribute,
    Class,
    //Comment,
    Tag
};

type Selector = {
    semanticeName: string,
    imperativeName: string,
    type: SelectorType
};

const RE_SELECTOR_ATTRIBUTE = /^\[([a-z\-_]+)\]$/i;
const RE_SELECTOR_CLASS = /^\.([a-z\-_]+)$/i;
//const RE_SELECTOR_COMMENT = /^\/\/([a-z\-_]+)$/i;
const RE_SELECTOR_TAG = /^([a-z\-_]+)$/i;

export function parseSelector(selector: string): Selector {
    
    var semanticeName: string;
    var type: SelectorType;
    var m: RegExpMatchArray;
    
    if (m = RE_SELECTOR_TAG.exec(selector)) {
        type = SelectorType.Tag;
    }
    else if (m = RE_SELECTOR_ATTRIBUTE.exec(selector)) {
        type = SelectorType.Attribute;
    }
    else if (m = RE_SELECTOR_CLASS.exec(selector)) {
        type = SelectorType.Class;
    }
    //else if (m = RE_SELECTOR_COMMENT.exec(selector)) {
    //    type = SelectorType.Comment;
    //}
    else {
        throw new Error(`Invalid selector: ${selector}`);
    }

    return {
        semanticeName: m[1],
        imperativeName: 'TODO',
        type: type
    };
}

/**
 * @internal
 */
export function bindAll<T>(host: T): T {
    
    var aux = <any> host;
    
    if (aux) {
        for (let key in aux) {
            if (isFunction(aux[key])) {
                aux[key] = aux[key].bind(aux);
            }
        }
    }
    
    return host;
    
}