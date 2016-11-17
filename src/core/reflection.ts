import {forEach, isDefined} from './utils';

export const ANNOTATIONS_METADATA_KEY = 'tng';

const functionPrototype = Object.getPrototypeOf(Function);

function GetPrototypeOf(O: any): Object {

    let proto = Object.getPrototypeOf(O);
    if (typeof O !== "function" || O === functionPrototype) {
        return proto;
    }

    // TypeScript doesn't set __proto__ in ES5, as it's non-standard.
    // Try to determine the superclass constructor. Compatible implementations
    // must either set __proto__ on a subclass constructor to the superclass constructor,
    // or ensure each class has a valid `constructor` property on its prototype that
    // points back to the constructor.

    // If this is not the same as Function.[[Prototype]], then this is definately inherited.
    // This is the case when in ES6 or when using __proto__ in a compatible browser.
    if (proto !== functionPrototype) {
        return proto;
    }

    // If the super prototype is Object.prototype, null, or undefined, then we cannot determine the heritage.
    let prototype = O.prototype;
    let prototypeProto = Object.getPrototypeOf(prototype);
    if (prototypeProto == null || prototypeProto === Object.prototype) {
        return proto;
    }

    // if the constructor was not a function, then we cannot determine the heritage.
    let constructor = prototypeProto.constructor;
    if (typeof constructor !== "function") {
        return proto;
    }

    // if we have some kind of self-reference, then we cannot determine the heritage.
    if (constructor === O) {
        return proto;
    }

    // we have a pretty good guess at the heritage.
    return constructor;

}

function getKey(key?: string): string {
	return !key ? ANNOTATIONS_METADATA_KEY : `${ANNOTATIONS_METADATA_KEY}:${key}`;
}

export function getAnnotations(target: any, type?: Function, key?: string): any[] {

    let metas: any[] = [];
    let proto = target;

    do {
        metas.push(getOwnAnnotations(proto, type, key));
        proto = GetPrototypeOf(proto);
    } while (typeof proto === "function" && proto !== functionPrototype);

    metas.reverse();
    let annotations: any[] = [];

    for (let i = 0; i < metas.length; i++) {
        annotations = annotations.concat(metas[i]);
    }

    return annotations;

}

// export function getAnnotations(target: any, type?: Function, key?: string): any[] {

// 	var annotations = <any[]> Reflect.getMetadata(getKey(key), target) || [];

// 	if (type) {
// 		return annotations.filter((value) => value instanceof type);
// 	}

// 	return annotations.slice(0);

// }

export function getOwnAnnotations(target: any, type?: Function, key?: string): any[] {

	var annotations = <any[]> Reflect.getOwnMetadata(getKey(key), target) || [];

	if (type) {
		return annotations.filter((value) => value instanceof type).reverse();
	}

	return annotations.slice(0).reverse();

}

export function setAnnotations(target: any, annotations: any[], key?: string):void {

	Reflect.defineMetadata(getKey(key), annotations, target);

}

export function addAnnotation(target: any, annotation: any, key?: string):void {

	var annotations = getOwnAnnotations(target, null, key);
	annotations.push(annotation);
	setAnnotations(target, annotations, key);

}

export function hasAnnotation(target: any, type?: Function, key?: string): boolean {

	if (!type) {
		return Reflect.hasMetadata(getKey(key), target);
	}

	return getAnnotations(target, type, key).length > 0;

}

export function hasOwnAnnotation(target: any, type?: Function, key?: string): boolean {

	if (!type) {
		return Reflect.hasOwnMetadata(getKey(key), target);
	}

	return getAnnotations(target, type, key).length > 0;

}

// export function mergeAnnotations(...annotations: any[]): any;
export function mergeAnnotations<Type>(...annotations: any[]): Type;
export function mergeAnnotations(...annotations: any[]): any {

	if (!annotations.length) {
		return null;
	}
	else if (annotations.length == 1) {
		return annotations[0];
	}

	var dest = <{ [key: string]: any }><any> annotations.shift();

	for (let source of annotations) {
		forEach(source, (value, key) => {
			// We only replace if defined (nulls are ok, they remove previously set values)
			if (isDefined(value)) {
				dest[key] = value;
			}
		});
	}

	return <any> dest;

}

export function makeDecorator<T extends Function>(annotationClass: T) {

    return function() {

        let annotationInstance = Object.create(annotationClass.prototype);
        annotationClass.apply(annotationInstance, arguments);

        return function(target: T) {
            addAnnotation(target, annotationInstance);
            return target;
        }

    }

}

export function makeParamDecorator<T extends Function>(annotationClass: T) {

    return function() {

        let annotationInstance = Object.create(annotationClass.prototype);
        annotationClass.apply(annotationInstance, arguments);

        return function(target: T, unusedKey: string, index: number) {

            let parameters = Reflect.getMetadata('parameters', target);
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