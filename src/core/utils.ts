// import * as angular from "angular";
import {addAnnotation} from './reflection';



type extendSignature = <Type>(dest: Type, ...rest: any[]) => Type;

export let isDefined = angular.isDefined;
export let isString = angular.isString;
export let isNumber = angular.isNumber;
export let isObject = angular.isObject;
export let isElement = angular.isElement;
export let isDate = angular.isDate;
export let isArray = angular.isArray;
export let isFunction = angular.isFunction;
export let forEach = angular.forEach;
export let extend = <extendSignature> angular.extend;
export let copy = <extendSignature> angular.copy;
export let merge = <extendSignature> (<any> angular).merge;
export let mergeIfValue = <extendSignature> _mergeIfValue;

/**
 * @internal
 */
export type TFunctionReturningNothing = (...args: any[]) => void;

/**
 * @internal
 */
export type TFunctionReturningSomething = (...args: any[]) => any;

/**
 * @internal
 */
export type TFunctionReturningString = (...args: any[]) => string;

/**
 * @internal
 */
export type TFunctionReturningNumber = (...args: any[]) => number;

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

	for (let key in source) {
        if (source.hasOwnProperty(key) && isDefined(source[key])) {
            target[key] = source[key];
        }
    }

}

export function setIfInterface(target:any, source:any) {

    if (target == null || source == null) {
        return;
    }

	for (let key in source) {
        if (source.hasOwnProperty(key) && isDefined(source[key])) {
            if (target.hasOwnProperty(key)) {
                target[key] = source[key];
            }
        }
    }

}

// export function makeDecorator<T extends Function>(annotationClass: T) {

//     return function() {

//         let annotationInstance = Object.create(annotationClass.prototype);
//         annotationClass.apply(annotationInstance, arguments);

//         return function(target: T) {
//             addAnnotation(target, annotationInstance);
//             return target;
//         }

//     }

// }

// export function makeParamDecorator<T extends Function>(annotationClass: T) {

//     return function() {

//         let annotationInstance = Object.create(annotationClass.prototype);
//         annotationClass.apply(annotationInstance, arguments);

//         return function(target: T, unusedKey: string, index: number) {

//             let parameters = Reflect.getMetadata('parameters', target);
//             parameters = parameters || [];

//             // there might be gaps if some in between parameters do not have annotations.
//             // we pad with nulls.
//             while (parameters.length <= index) {
//                 parameters.push(null);
//             }

//             parameters[index] = annotationInstance;
//             Reflect.defineMetadata('parameters', parameters, target);
//             return target;

//         }

//     }

// }

export const enum SelectorType {
    Attribute,
    Class,
    //Comment,
    Tag
};

export interface ISelector {
    semanticeName: string;
    imperativeName: string;
    type: SelectorType;
};

const RE_SELECTOR_ATTRIBUTE = /^\[([a-z_][a-z\-_0-9]+)\]$/i;
const RE_SELECTOR_CLASS = /^\.([a-z_][a-z\-_0-9]+)$/i;
//const RE_SELECTOR_COMMENT = /^\/\/([a-z_][a-z\-_0-9]+)$/i;
const RE_SELECTOR_TAG = /^([a-z_][a-z\-_0-9]+)$/i;

export function parseSelector(selector: string): ISelector {

    let semanticeName: string;
    let type: SelectorType;
    let m: RegExpMatchArray;

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
        imperativeName: toCamelCase(m[1]),
        type: type
    };
}

// from mout @ https://github.com/mout/mout/blob/v0.11.0/src/string/camelCase.js
function toCamelCase(str: string) {
    str = str.replace(/[\-_]/g, ' ') //convert all hyphens and underscores to spaces
        .replace(/\s[a-z]/g, upperCase) //convert first char of each word to UPPERCASE
        .replace(/\s+/g, '') //remove spaces
        .replace(/^[A-Z]/g, lowerCase); //convert first char to lowercase
    return str;
}
function upperCase(str: string){
    return str.toUpperCase();
}
function lowerCase(str: string) {
    return str.toLowerCase();
}

/**
 * @internal
 */
export function bindFunctions<T>(host: T): T {

    let aux = <any> host;

    if (aux) {
        for (let key in aux) {
            if (isFunction(aux[key])) {
                aux[key] = safeBind(aux[key], aux);
            }
        }
    }

    return host;

}

export function safeBind<T extends Function>(func: T, context: any): T {

    let bound = func.bind(context);

    forEach(func, (value, name) => bound[name] = value);

    return bound;

}



// --

/**
 * Set or clear the hashkey for an object.
 * @param obj object
 * @param h the hashkey (!truthy to delete the hashkey)
 */
function setHashKey(obj:any, h:any) {
  if (h) {
    obj.$$hashKey = h;
  } else {
    delete obj.$$hashKey;
  }
}


function baseExtend(dst:any, objs:any[], deep:boolean, ifValue:boolean=false):any {
  let h = dst.$$hashKey;

  for (let i = 0, ii = objs.length; i < ii; ++i) {
    let obj = objs[i];
    if (!isObject(obj) && !isFunction(obj)) continue;
    let keys = Object.keys(obj);
    for (let j = 0, jj = keys.length; j < jj; j++) {
      let key = keys[j];
      let src = obj[key];

      if (deep && isObject(src)) {
        if (!isObject(dst[key])) dst[key] = isArray(src) ? [] : {};
        baseExtend(dst[key], [src], true);
      } else if (!ifValue || src != null) {
        dst[key] = src;
      }
    }
  }

  setHashKey(dst, h);
  return dst;
}

function _mergeIfValue(dst:any):any {
    return baseExtend(dst, [].slice.call(arguments, 1), true, true);
}