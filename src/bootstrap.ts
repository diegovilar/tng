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

import {getAnnotations} from './reflection';
import {merge, create} from './utils';
import {ApplicationConstructor, ApplicationAnnotation} from './annotations/application';
import {ModuleConstructor, ModuleAnnotation, registerModule} from './annotations/module';

/**
 * 
 */
export function bootstrap(moduleClass: ApplicationConstructor): ng.auto.IInjectorService;
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