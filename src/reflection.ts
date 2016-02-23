/// <reference path="./_references" />

import {forEach, isDefined} from './utils';

export const ANNOTATIONS_METADATA_KEY = 'tng';

var _Reflect = Reflect;
export {_Reflect as Reflect};

function getKey(key?: string): string {
	return !key ? ANNOTATIONS_METADATA_KEY : `${ANNOTATIONS_METADATA_KEY}:${key}`;
}

export function getAnnotations(target: any, type?: Function, key?: string): any[] {

	var annotations = <any[]> Reflect.getMetadata(getKey(key), target) || [];
	// var annotations = <any[]> Reflect.getOwnMetadata(getKey(key), target) || [];

	if (type) {
		return annotations.filter((value) => value instanceof type);
	}

	return annotations.slice(0);

}

export function setAnnotations(target: any, annotations: any[], key?: string):void {

	Reflect.defineMetadata(getKey(key), annotations, target);

}

export function addAnnotation(target: any, annotation: any, key?: string):void {

	var annotations = getAnnotations(target, null, key);
	annotations.push(annotation);
	setAnnotations(target, annotations, key);

}

export function hasAnnotation(target: any, type?: Function, key?: string): boolean {

	if (!type) {
		return Reflect.hasMetadata(getKey(key), target);
		// return Reflect.hasOwnMetadata(getKey(key), target);
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