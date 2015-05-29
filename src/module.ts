/// <reference path="./_references" />

import {getAnnotations, hasAnnotation, Reflect} from './reflection';
import {makeDecorator, setIfInterface, FunctionReturningNothing} from './utils';
import {merge, create, isString, isFunction} from './utils';
import {ValueAnnotation, registerValue} from './value';
import {ConstantAnnotation, registerConstant} from './constant';
import {FilterAnnotation, registerFilter} from './filter';
import {AnimationAnnotation, registerAnimation} from './animation';
import {ServiceAnnotation, registerService} from './service';
import {DecoratorAnnotation, registerDecorator} from './decorator';
import {DirectiveAnnotation, registerDirective} from './directive';
import {ComponentAnnotation, registerComponent} from './component';
import {registerStates} from './ui-router/states';
import {registerRoutes} from './ui-router/routes';

const PUBLISHED_ANNOTATION_KEY = 'tng:module-published-as';

/**
 * Options available when decorating a class as a module
 * TODO document
 */
export interface ModuleOptions {
	dependencies?: (string|Function)[];
	config?: Function|Function[];
	run?: Function|Function[];

	name?: string;
	modules?: (string|Function)[];
	components?: Function[];
	services?: Function[];
	filters?: Function[];
	decorators?: Function[];
	animations?: Function[];
	values?: Function[];
	constants?: Function[];
}

/**
 * @internal
 */
export class ModuleAnnotation {

	dependencies: (string|Function)[] = null;
	config: Function|Function[] = null;
	run: Function|Function[] = null;

	name: string = '';
	modules: (string|Function)[] = null;
	components: Function[] = null;
	services: Function[] = null;
	filters: Function[] = null;
	decorators: Function[] = null;
	animations: Function[] = null;
	values: Function[] = null;
	constants: Function[] = null;

	constructor(options: ModuleOptions) {
		setIfInterface(this, options);
	}

}

/**
 * Interface modules MAY implement
 * TODO document
 */
export interface Module {
	onConfig?: FunctionReturningNothing;
	onRun?: FunctionReturningNothing;
}

/**
 * @internal
 */
export interface ModuleConstructor extends Function {
	new (): Module;
	new (ngModule: ng.IModule): Module;
}

type ModuleSignature = (options: ModuleOptions) => ClassDecorator;

/**
 * A decorator to annotate a class as being a module
 */
export var Module = <ModuleSignature> makeDecorator(ModuleAnnotation);

var moduleCount = 0;

function getNewModuleName() {
    
    return `tng_generated_module#${++moduleCount}`;
    
}

/**
 * @internal
 */
export function registerModule(moduleClass: ModuleConstructor, name?: string): ng.IModule {

    var aux: any[];
    var moduleNotes: ModuleAnnotation;

    aux = getAnnotations(moduleClass, ModuleAnnotation);

    if (!aux.length) {
        throw new Error('No module annotation found');
    }

    moduleNotes = merge(create(ModuleAnnotation), ...aux);

    var constants: any[] = [];
    var values: any[] = [];
    var services: any[] = [];
    var decorators: any[] = [];
    var filters: any[] = [];
    var animations: any[] = [];
    var components: any[] = [];
    var directives: any[] = [];
    var modules: any[] = [];

    // TODO optimize this.. to much reflection queries
    for (let dep of moduleNotes.dependencies) {
        // Regular angular module
        if (isString(dep)) {
            modules.push(dep);
        }
        else if (hasAnnotation(dep, ModuleAnnotation)) {
            if (Reflect.hasOwnMetadata(PUBLISHED_ANNOTATION_KEY, dep)) {
                modules.push(Reflect.getOwnMetadata(PUBLISHED_ANNOTATION_KEY, dep));
            }
            else {
                modules.push(registerModule(<ModuleConstructor> dep).name);
            }
        }
        else if (hasAnnotation(dep, ConstantAnnotation, 'constant')) {
            constants.push(dep);
        }
        else if (hasAnnotation(dep, ValueAnnotation, 'value')) {
            values.push(dep);
        }
        else if (hasAnnotation(dep, ServiceAnnotation)) {
            services.push(dep);
        }
        else if (hasAnnotation(dep, DecoratorAnnotation)) {
            decorators.push(dep);
        }
        else if (hasAnnotation(dep, FilterAnnotation)) {
            filters.push(dep);
        }
        else if (hasAnnotation(dep, AnimationAnnotation)) {
            animations.push(dep);
        }
        else if (hasAnnotation(dep, ComponentAnnotation)) {
            components.push(dep);
        }
        else if (hasAnnotation(dep, DirectiveAnnotation)) {
            directives.push(dep);
        }
        else {
            // TODO WTF?
            throw new Error(`I don't recognize what kind of dependency is this: ${dep}`);
        }
    }

    name = name || moduleNotes.name || getNewModuleName();
    
    // Register the module on Angular
    var ngModule = angular.module(name, modules);    
        
    // Instantiate the module
    var module = new moduleClass(ngModule);
    
    // Register config functions
    var configFns: Function[] = [];
    if (isFunction(module.onConfig)) configFns.push(module.onConfig.bind(module));
    if (moduleNotes.config) {
        if (isFunction(moduleNotes.config)) configFns.push(<Function> moduleNotes.config);
        else configFns = configFns.concat(<Function[]> moduleNotes.config)
    }
    for (let fn of configFns) ngModule.config(fn);
    
    // Register initialization functions
    var runFns: Function[] = [];
    if (isFunction(module.onRun)) runFns.push(module.onRun.bind(module));
    if (moduleNotes.run) {
        if (isFunction(moduleNotes.run)) runFns.push(<Function> moduleNotes.run);
        else runFns = runFns.concat(<Function[]> moduleNotes.run)
    }
    for (let fn of runFns) ngModule.run(fn);
    
    registerStates(moduleClass, ngModule);
    registerRoutes(moduleClass, ngModule);

    for (let item of values) registerValue(item, ngModule);
    for (let item of constants) registerConstant(item, ngModule);
    for (let item of filters) registerFilter(item, ngModule);
    for (let item of animations) registerAnimation(item, ngModule);
    for (let item of services) registerService(item, ngModule);
    for (let item of decorators) registerDecorator(item, ngModule);
    for (let item of components) registerComponent(item, ngModule);
    for (let item of directives) registerDirective(item, ngModule);

    Reflect.defineMetadata(PUBLISHED_ANNOTATION_KEY, name, moduleClass);
    
    return ngModule;

}

/**
 * Unwraps a TNG module, registering it and its dependencies on Angular.
 */
export {registerModule as unwrapModule};