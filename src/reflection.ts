/// <reference path="./_references" />

export const ANNOTATIONS_METADATA_KEY = 'tng';

var _Reflect = Reflect;
export {_Reflect as Reflect};

function getKey(key?: string): string {
	return !key ? ANNOTATIONS_METADATA_KEY : `${ANNOTATIONS_METADATA_KEY}:${key}`;
}

export function getAnnotations(target: any, type?: Function, key?: string): any[] {

	var annotations = <any[]> Reflect.getOwnMetadata(getKey(key), target) || [];

	if (type) {
		return annotations.filter((value) => value instanceof type);
	}

	return annotations;

}

export function setAnnotations(target: any, annotations: any[], key?: string) {

	Reflect.defineMetadata(getKey(key), annotations, target);

}

export function addAnnotation(target: any, annotation: any, key?: string) {

	var annotations = getAnnotations(target, null, key);
	annotations.push(annotation);
	setAnnotations(target, annotations, key);

}

export function hasAnnotation(target: any, type?: Function, key?: string): boolean {

	if (!type) {
		return Reflect.hasOwnMetadata(getKey(key), target);
	}

	return getAnnotations(target, type, key).length > 0;

}