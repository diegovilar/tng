// TODO debug only?
import {assert} from './assert'
import {getAnnotations, hasAnnotation, mergeAnnotations, Reflect} from './reflection'
import {makeDecorator, setIfInterface, FunctionReturningNothing} from './utils'
import {safeBind} from './di'
import {create, isString, isFunction, isArray} from './utils'
import {ValueWrapper, publishValue} from './value'
import {ConstantWrapper, publishConstant} from './constant'
import {FilterAnnotation, registerFilter} from './filter'
import {AnimationAnnotation, registerAnimation} from './animation'
import {ServiceAnnotation, publishService} from './service'
import {DecoratorAnnotation, publishDecorator} from './decorator'
import {DirectiveAnnotation, publishDirective} from './directive'
import {ComponentAnnotation, publishComponent} from './component'
import {publishStates} from './ui/router/states'
import {registerRoutes} from './ui/router/routes'



const PUBLISHED_ANNOTATION_KEY = 'tng:module-published-as';

export type Dependency = string|Function|ConstantWrapper<any>|ValueWrapper<any>;
export type DependenciesArray = (Dependency|Dependency[])[];

/**
 * Options available when decorating a class as a module
 * TODO document
 */
export interface ModuleOptions {
	name?: string;
	dependencies?: DependenciesArray;
	config?: Function|Function[];
	run?: Function|Function[];

    // modules?: (string|Function)[];
	// components?: Function[];
	// services?: Function[];
	// filters?: Function[];
	// decorators?: Function[];
	// animations?: Function[];
	// values?: Function[];
	// constants?: Function[];
}

/**
 * @internal
 */
export class ModuleAnnotation {

	name: string = void 0;
	dependencies: DependenciesArray = void 0;
	config: Function|Function[] = void 0;
	run: Function|Function[] = void 0;

	// modules: (string|Function)[] = void 0;
	// components: Function[] = void 0;
	// services: Function[] = void 0;
	// filters: Function[] = void 0;
	// decorators: Function[] = void 0;
	// animations: Function[] = void 0;
	// values: Function[] = void 0;
	// constants: Function[] = void 0;

	constructor(options?: ModuleOptions) {
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

type ModuleSignature = (options?: ModuleOptions) => ClassDecorator;

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
export function publishModule(moduleClass: ModuleConstructor, name?: string,
    dependencies?: DependenciesArray, constructorParameters?: any[]): ng.IModule {

    // Reflect.decorate apply decorators reversely, so we need to reverse
    // the extracted annotations before merging them
    // var aux = getAnnotations(moduleClass, ModuleAnnotation).reverse();
    var aux = getAnnotations(moduleClass, ModuleAnnotation);

    // TODO debug only?
    assert.notEmpty(aux, 'Missing @Module decoration');

    // Has this module already been published?
    var publishedAs: string;
    if (publishedAs = Reflect.getOwnMetadata(PUBLISHED_ANNOTATION_KEY, moduleClass)) {
        return angular.module(publishedAs);
    }

    var annotation = <ModuleAnnotation> mergeAnnotations(Object.create(null), ...aux);

    var constants: any[] = [];
    var values: any[] = [];
    var services: any[] = [];
    var decorators: any[] = [];
    var filters: any[] = [];
    var animations: any[] = [];
    var components: any[] = [];
    var directives: any[] = [];
    var modules: any[] = [];

    // TODO optimize this.. too much reflection queries
    function processDependency(dep: Dependency|Dependency[]): void {

        // Regular angular module
        if (isString(dep)) {
            modules.push(dep);
        }
        else if (isArray(dep)) {
            for (let _dep of <Dependency[]> dep) {
                processDependency(_dep);
            }
        }
        else if (hasAnnotation(dep, ModuleAnnotation)) {
            // If the module has alrady been published, we just push it's name
            // if (publishedAs = Reflect.getOwnMetadata(PUBLISHED_ANNOTATION_KEY, dep)) {
                // modules.push(publishedAs);
            // }
            // else {
                modules.push(publishModule(<ModuleConstructor> dep).name);
            // }
        }
        else if (dep instanceof ConstantWrapper) {
            constants.push(dep);
        }
        else if (dep instanceof ValueWrapper) {
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
            throw new Error(`I don't recognize what kind of dependency this is: ${dep}`);
        }

    }

    let allDeps = [].concat(
        (annotation.dependencies || []),
        (dependencies || [])
    );

    allDeps.forEach((dep) => processDependency(dep));

    name = name || annotation.name || getNewModuleName();

    // Register the module on Angular
    var ngModule = angular.module(name, modules);

    // Instantiate the module
    // var module = new moduleClass(ngModule);
    let module = Object.create(moduleClass.prototype);
    moduleClass.apply(module, [ngModule].concat(constructorParameters || []))

    // Register config functions
    var configFns: Function[] = [];
    if (isFunction(module.onConfig)) configFns.push(safeBind(module.onConfig, module));
    if (annotation.config) {
        if (isFunction(annotation.config)) configFns.push(<Function> annotation.config);
        else if (isArray(annotation.config)) configFns = configFns.concat(<Function[]> annotation.config)
    }
    for (let fn of configFns) ngModule.config(fn);

    // Register initialization functions
    var runFns: Function[] = [];
    if (isFunction(module.onRun)) runFns.push(safeBind(module.onRun, module));
    if (annotation.run) {
        if (isFunction(annotation.run)) runFns.push(<Function> annotation.run);
        else if (isArray(annotation.run)) runFns = runFns.concat(<Function[]> annotation.run)
    }
    for (let fn of runFns) ngModule.run(fn);

    publishStates(moduleClass, ngModule);
    registerRoutes(moduleClass, ngModule);

    for (let item of values) publishValue(item, ngModule);
    for (let item of constants) publishConstant(item, ngModule);
    for (let item of filters) registerFilter(item, ngModule);
    for (let item of animations) registerAnimation(item, ngModule);
    for (let item of services) publishService(item, ngModule);
    for (let item of decorators) publishDecorator(item, ngModule);
    for (let item of components) publishComponent(item, ngModule);
    for (let item of directives) publishDirective(item, ngModule);

    Reflect.defineMetadata(PUBLISHED_ANNOTATION_KEY, name, moduleClass);

    return ngModule;

}