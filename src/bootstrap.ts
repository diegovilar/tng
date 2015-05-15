/// <reference path="./_references" />

/*
Applications must have:
	- Module annotation

Applications may have
	- Component annotation
	- view annotation 

Steps to bootstrap:

	- Iterate through submodules (recursively)
		- Register modules on Angular
			- Register config and run functions
		- Register services on Angular
			- Register config and run functions
		- Register directives on Angular
			- Register config and run functions
		- Register components on Angular
			- Register config and run functions
			- Gather route annotations
	- Register application module on Angular
	- Register config and run functions
	- Bootstrap	

*/
import {getAnnotations} from './reflection';
import {isFunction, isString, isDefined} from './utils';
import {
	ApplicationAnnotation,
	ModuleAnnotation,
	ViewAnnotation,
	ComponentAnnotation,
	ServiceAnnotation
} from './annotations';

export function bootstrap(appClass:Function):void;
export function bootstrap(appClass:Function, selector:string):void;
export function bootstrap(appClass:Function, element:Element):void;

export function bootstrap(appClass:Function, selectorOrElement?:string|Element):void {
	
	var selector = 'html';
	var element:ng.IAugmentedJQuery;
	
	if (typeof selectorOrElement == 'string') {
		selector = <string> selectorOrElement;
	}
	else {
		element = angular.element(<Element> selectorOrElement);
	}
	
	if (!element) {
		element = angular.element(selector);
	}
	
	var aux:any;
	
	var appNote:ApplicationAnnotation;
	aux = getAnnotations(appClass, ApplicationAnnotation);
	if (aux.length) {
		appNote = mergeAnnotations(aux, create(ApplicationAnnotation));
	}
	
	var viewNote:ViewAnnotation;
	aux = getAnnotations(appClass, ViewAnnotation);
	if (aux.length) {
		viewNote = mergeAnnotations(aux, create(ViewAnnotation));
	}
	
	var compNote:ComponentAnnotation;
	aux = getAnnotations(appClass, ComponentAnnotation);
	if (aux.length) {
		compNote = mergeAnnotations(aux, create(ComponentAnnotation));
	}
	
}

export function registerModule(moduleClass:Function):ng.IModule {
	
	var notes = getAnnotations(moduleClass, ModuleAnnotation);
	
	if (!notes.length) {
		throw new Error('No module annotation found');
	}
	
	var note = mergeAnnotations(notes, create(ModuleAnnotation));
	
	// Recurse through modules this one depends on
	var deps:string[] = [];
	if (note.modules) for (let module of note.modules) {
		deps.push(isString(module) ? module : registerModule(module).name);
	}
	
	// Create this angular module
	var ngModule = angular.module(note.name, deps);
	
	// Register services
	if (note.services) for (let serviceClass of note.services) {
		registerService(ngModule, serviceClass);
	}
	
	// Register directives
	if (note.directives) for (let directiveClass of note.directives) {
		registerDirective(ngModule, directiveClass);
	}
	
	// Register components
	if (note.components) for (let componentClass of note.components) {
		registerComponent(ngModule, componentClass);
	}
	
	// Instantiate the module class
	var module = new (<any> moduleClass)();
	
	// Register config function
	if (isFunction(module.config)) {
		ngModule.config(module.config);
	}
	
	// Register run function
	if (isFunction(module.run)) {
		ngModule.run(module.run);
	}
	
	return ngModule;
	
}



// -- Private --

function registerService(ngModule:ng.IModule, ServiceClass:Function) {	

	var aux = getAnnotations(ServiceClass, ServiceAnnotation);
	
	if (!aux.length) {
		throw new Error("Service annotation not found");
	}
	
	var note = mergeAnnotations(aux, create(ServiceAnnotation));
    var name = note.name;
	
	if (isDefined(note.provider)) {
		ngModule.provider(name, <any> note.provider);
	}
	else if (isDefined(note.factory)) {
		ngModule.factory(name, note.factory);
	}
	else {
									// Invoked later with $injector.invoke()?
		ngModule.service(name, ServiceClass);
	}

}

function registerComponent(ngModule:ng.IModule, ComponentClass:Function) {
	
	var aux = getAnnotations(ComponentClass, ComponentAnnotation);
	if (!aux.length) {
		throw new Error("Component annotation not found");
	}
	
	var note = mergeAnnotations(aux, create(ComponentAnnotation));
	
}

function registerDirective(ngModule:ng.IModule, DirectiveClass:Function) {	
}



// -- Utils --

function mergeAnnotations<T extends Array<any>>(annotations:T):any;
function mergeAnnotations<TArray extends Array<any>, TTarget>(annotations:TArray, target:TTarget):TTarget;
function mergeAnnotations(annotations:any[], target?:any):any {
	
	var args = annotations.slice(0);	
	args.unshift(target ? target : {});
	return angular.extend.apply(angular, args);	
	
}

function create<T, U>(constructor:{prototype: U}):U {
	
	return Object.create(constructor.prototype);
	
}

function getApplicationAnnotations(target:any):ApplicationAnnotation[] {
	
	return <ApplicationAnnotation[]> getAnnotations(target, ApplicationAnnotation);
	
}

function getModuleAnnotations(target:any):ModuleAnnotation[] {
	
	return <ModuleAnnotation[]> getAnnotations(target, ModuleAnnotation);
	
}

function getViewAnnotations(target:any):ViewAnnotation[] {
	
	return <ViewAnnotation[]> getAnnotations(target, ViewAnnotation);
	
}

function getComponentAnnotations(target:any):ComponentAnnotation[] {
	
	return <ComponentAnnotation[]> getAnnotations(target, ComponentAnnotation);
	
}
