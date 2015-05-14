/// <reference path="./_references" />

import {Reflect, getAnnotations, addAnnotations} from './reflection';

export var isDefined = angular.isDefined;
export var isString = angular.isString;
export var isNumber = angular.isNumber;
export var isObject = angular.isObject;
export var isElement = angular.isElement;
export var isDate = angular.isDate;
export var isArray = angular.isArray;
export var isFunction = angular.isFunction;

export function makeDecorator<T extends Function>(annotationClass:T) {
  
    return function() {
  
        var annotationInstance = Object.create(annotationClass.prototype);
        annotationClass.apply(annotationInstance, arguments);
    
        return function(target:T) {
            addAnnotations(target, annotationInstance);
            return target;
        }
        
    }  
    
}

export function makeParamDecorator<T extends Function>(annotationClass:T) {
    
    return function() {
    
        var annotationInstance = Object.create(annotationClass.prototype);
        annotationClass.apply(annotationInstance, arguments);
        
        return function(target:T, unusedKey:string, index:number) {
            
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