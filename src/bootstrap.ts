/// <reference path="./_references" />

/*
Applications must have:
    - Module annotation

Steps to bootstrap:

    - Process submodules (recursively)
    - Process the application module
    - Bootstrap
    
To process a module is to:
    - Iterate through it's submodules and process them (recurse)
        - Register the module on Angular            
        - Register services on Angular
        - Register directives on Angular
        - Register components on Angular
            - Gather route annotations
        - Register config and run functions
*/

import {getAnnotations, hasAnnotation} from './reflection';
import {isFunction, isString, isDefined, merge, create, parseSelector, SelectorType} from './utils';
import {Inject} from './annotations';
//import {View, ViewAnnotation} from './annotations';
import {Module, ModuleConstructor, ModuleAnnotation} from './annotations';
import {Application, ApplicationAnnotation} from './annotations';
import {Component, ComponentConstructor, ComponentAnnotation, makeDirectiveFactory} from './annotations';
import {Service, ServiceConstructor, ServiceAnnotation} from './annotations';
import {Filter, FilterConstructor, FilterAnnotation} from './annotations';
import {ServiceDecorator, DecoratorConstructor, ServiceDecoratorAnnotation} from './annotations';
import {Value, ValueAnnotation} from './annotations';
import {ConstantWrapper, ConstantAnnotation} from './annotations';

/**
 * 
 */
export function bootstrap(moduleClass: ModuleConstructor): ng.auto.IInjectorService;
export function bootstrap(moduleClass: ModuleConstructor, element: Element): ng.auto.IInjectorService;
export function bootstrap(moduleClass: ModuleConstructor, selector: string): ng.auto.IInjectorService;
export function bootstrap(moduleClass: ModuleConstructor, selectorOrElement?: any): ng.auto.IInjectorService {

    var aux: ModuleAnnotation[];
    var appNotes: ApplicationAnnotation;

    aux = getAnnotations(moduleClass, ModuleAnnotation);
    if (!aux.length) {
        throw new Error('No module annotation found');
    }
    appNotes = merge(create(ApplicationAnnotation), ...aux);

    selectorOrElement = selectorOrElement || appNotes.selector;
    if (!selectorOrElement) {
        throw new Error('No selector specified');
    }

    var ngModule = registerModule(moduleClass);

    return angular.bootstrap(selectorOrElement, [ngModule.name]);

}

//export function bootstrapWhenReady(moduleClass: ModuleConstructor): Promise<ng.auto.IInjectorService>;
//export function bootstrapWhenReady(moduleClass: ModuleConstructor, element: Element): Promise<ng.auto.IInjectorService>;
//export function bootstrapWhenReady(moduleClass: ModuleConstructor, selector: string): Promise<ng.auto.IInjectorService>;
//export function bootstrapWhenReady(moduleClass: ModuleConstructor, selectorOrElement?: any): Promise<ng.auto.IInjectorService> {
//    
//    var promise = new Promise<ng.auto.IInjectorService>((resolve, reject) => {
//        // TODO
//    });
//    
//    return promise;
//    
//}

/**
 * 
 */
function registerModule(moduleClass: ModuleConstructor, name?: string): ng.IModule {

    var aux: any[];
    var moduleNotes: ModuleAnnotation;

    aux = getAnnotations(moduleClass, ModuleAnnotation);

    if (!aux.length) {
        throw new Error('No module annotation found');
    }

    moduleNotes = merge(create(ModuleAnnotation), ...aux);

    var modules: any[] = [];
    var services: any[] = [];
    var components: any[] = [];
    var values: any[] = [];
    var constants: any[] = [];
    var filters: any[] = [];
    var decorators: any[] = [];

    // TODO optimize this.. to much reflection queries
    for (let dep of moduleNotes.dependencies) {
        // Regular angular module
        if (isString(dep)) {
            modules.push(dep);
        }
        else if (hasAnnotation(dep, ModuleAnnotation)) {
            modules.push(registerModule(<ModuleConstructor> dep).name);
        }
        else if (hasAnnotation(dep, ServiceAnnotation)) {
            services.push(dep);
        }
        else if (hasAnnotation(dep, ComponentAnnotation)) {
            components.push(dep);
        }
        else if (hasAnnotation(dep, ServiceDecoratorAnnotation)) {
            decorators.push(dep);
        }
        else if (hasAnnotation(dep, FilterAnnotation)) {
            filters.push(dep);
        }
        else if (hasAnnotation(dep, ConstantAnnotation, 'constant')) {
            constants.push(dep);
        }
        else if (hasAnnotation(dep, ValueAnnotation, 'value')) {
            values.push(dep);
        }
        else {
            // TODO WTF?
            throw new Error(`I don't recognize what kind of dependency is this: ${dep}`);
        }
    }

    name = name || moduleNotes.name || 'TODO RANDOM';
    
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
    
    // Register config functions
    var runFns: Function[] = [];
    if (isFunction(module.onRun)) runFns.push(module.onRun.bind(module));
    if (moduleNotes.run) {
        if (isFunction(moduleNotes.run)) runFns.push(<Function> moduleNotes.run);
        else runFns = runFns.concat(<Function[]> moduleNotes.run)
    }
    for (let fn of runFns) ngModule.run(fn);

    for (let item of services) registerService(item, ngModule);
    for (let item of components) registerComponent(item, ngModule);
    for (let item of decorators) registerDecorator(item, ngModule);
    for (let item of filters) registerFilter(item, ngModule);
    for (let item of values) registerValue(item, ngModule);
    for (let item of constants) registerConstant(item, ngModule);

    return ngModule;

}

export {registerModule as unwrap};

/**
 * 
 */
function registerService(serviceClass: ServiceConstructor, ngModule: ng.IModule) {

    var aux = getAnnotations(serviceClass, ServiceAnnotation);

    if (!aux.length) {
        throw new Error("Service annotation not found");
    }

    var annotation = merge(create(ServiceAnnotation), aux);
    var name = annotation.name;

    if (annotation.provider) {
        ngModule.provider(name, <any> annotation.provider);
    }
    else if (isFunction(annotation.factory)) {
        ngModule.factory(name, annotation.factory);
    }
    else {
        // TODO Is it invoked later with $injector.invoke()?
        ngModule.service(name, serviceClass);
    }

}

function registerComponent(componentClass: ComponentConstructor, ngModule: ng.IModule) {

    var aux = getAnnotations(componentClass, ComponentAnnotation);

    if (!aux.length) {
        throw new Error("Component annotation not found");
    }

    var {name, factory} = makeDirectiveFactory(componentClass);
    ngModule.directive(name, factory);
    
    // TODO register routes

}

function registerDecorator(decoratorClass: DecoratorConstructor, ngModule: ng.IModule) {

    var aux = getAnnotations(decoratorClass, ServiceDecoratorAnnotation);

    if (!aux.length) {
        throw new Error("Decorator annotation not found");
    }

    var {name} = merge(create(ServiceDecoratorAnnotation), aux);

    if (!isFunction(decoratorClass.prototype.decorate)) {
        throw new Error(`Decorator "${name}" does not implement a decorate method`);
    }

    ngModule.config(Inject(['$provide'], function($provide: ng.auto.IProvideService) {
        $provide.decorator(name, Inject(['$delegate', '$injector'], function($delegate: any, $injector: ng.auto.IInjectorService) {

            var instance = <ServiceDecorator> $injector.instantiate(decoratorClass, {
                $delegate: $delegate
            });

            return $injector.invoke(instance.decorate, instance, {
                $delegate: $delegate
            });

        }));
    }));

}

/**
 * 
 */
function registerFilter(filterClass: FilterConstructor, ngModule: ng.IModule) {

    var aux = getAnnotations(filterClass, FilterAnnotation);

    if (!aux.length) {
        throw new Error("Filter annotation not found");
    }

    var {name} = merge(create(FilterAnnotation), aux);

    if (!isFunction(filterClass.prototype.filter)) {
        throw new Error(`Filter "${name}" does not implement a filter method`);
    }

    ngModule.filter(name, Inject(['$injector'], function($injector: ng.auto.IInjectorService) {

        var filterSingleton = <Filter> $injector.instantiate(filterClass);
        return filterSingleton.filter.bind(filterSingleton);

    }));

}

/**
 * 
 */
function registerValue(value: Value, ngModule: ng.IModule) {

    var aux = getAnnotations(value, ValueAnnotation, 'value');

    if (!aux.length) {
        throw new Error("Value annotation not found");
    }

    var annotation = <ValueAnnotation<any>> aux[0];
    ngModule.value(annotation.name, annotation.value);

}

/**
 * 
 */
function registerConstant(constant: ConstantWrapper, ngModule: ng.IModule) {

    var aux = getAnnotations(constant, ConstantAnnotation, 'value');

    if (!aux.length) {
        throw new Error("Constant annotation not found");
    }

    var annotation = <ConstantAnnotation<any>> aux[0];
    ngModule.constant(annotation.name, annotation.constant);

}