import {TFunctionReturningSomething, setIfInterface} from './utils'
import {bindFunctions, create, isFunction} from './utils'
import {getAnnotations, makeDecorator, mergeAnnotations} from './reflection'

import {injectable} from './di'

/**
 * Options available when decorating a class as an animation controller
 * TODO document
 */
export interface AnimationOptions {

    /**
     * TODO rules?
     */
    name: string;
}

/**
 * @internal
 */
export class AnimationAnnotation {

    name: string = null;

    constructor(options: AnimationOptions) {
        setIfInterface(this, options);
    }

}

export type TEndFunction = (isCancelled: boolean) => void;

/**
 * Interface animation controllers MAY implement
 * TODO document
 */
export interface Animation {
    enter?: (element: ng.IAugmentedJQuery, done: Function) => TEndFunction;
    leave?: (element: ng.IAugmentedJQuery, done: Function) => TEndFunction;
    move?: (element: ng.IAugmentedJQuery, done: Function) => TEndFunction;
    addClass?: (element: ng.IAugmentedJQuery, className: string, done: Function) => TEndFunction;
    removeClass?: (element: ng.IAugmentedJQuery, className: string, done: Function) => TEndFunction;
}

/**
 * @internal
 */
export interface AnimationConstructor extends Function {
    new (...args: any[]): Animation;
    prototype: Animation;
}

type DecoratorSignature = (options: AnimationOptions) => ClassDecorator;

/**
 * A decorator to annotate a class as being an animation controller
 */
export var Animation = <DecoratorSignature> makeDecorator(AnimationAnnotation);

/**
 * @internal
 */
export function registerAnimation(animationClass: AnimationConstructor, ngModule: ng.IModule) {

    // Reflect.decorate apply decorators reversely, so we need to reverse
    // the extracted annotations before merging them
    // var aux = getAnnotations(animationClass, AnimationAnnotation).reverse();
    var aux = getAnnotations(animationClass, AnimationAnnotation);

    if (!aux.length) {
        throw new Error("Filter annotation not found");
    }

    var {name} = mergeAnnotations<AnimationAnnotation>(create(AnimationAnnotation), ...aux);

    // TODO validate implementation?

    ngModule.animation(name, injectable(['$injector'], function($injector: ng.auto.IInjectorService) {
        var singleton = <Animation> $injector.instantiate(animationClass);
        bindFunctions(singleton);
        return singleton;
    }));

}