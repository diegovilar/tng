import 'reflect-metadata'; // for it's side-effects

export const ANNOTATIONS_METADATA_KEY = 'annotations'; 

var _Reflect = Reflect;
export {_Reflect as Reflect};

//export function getAnnotations(target:any):any[];
//export function getAnnotations<T extends Function>(target:any, type?:T):T[];

//export function getAnnotations<T extends Function>(target:any, type?:T):(any|T)[] {
export function getAnnotations(target:any, type?:any):any[] {
	
	var annotations = <any[]> Reflect.getMetadata(ANNOTATIONS_METADATA_KEY, target) || [];
	
	if (type) {
		return annotations.filter((value) => value instanceof type);
	}
	
	return annotations;
	
}

export function setAnnotations(target: any, annotations:any[]) {
	
	Reflect.defineMetadata(ANNOTATIONS_METADATA_KEY, annotations, target);
	
}

export function addAnnotations(target: any, annotation:any) {
	
	var annotations = <any[]> getAnnotations(target);
	annotations.push(annotation);
	setAnnotations(target, annotations);
	
}