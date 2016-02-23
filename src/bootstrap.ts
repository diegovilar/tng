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

// TODO debug only?
import {assert} from './assert';

import {getAnnotations, mergeAnnotations} from './reflection';
import {create} from './utils';
import {ApplicationConstructor, ApplicationAnnotation} from './application';
import {ModuleConstructor, ModuleAnnotation, publishModule} from './module';

/**
 *
 */
export function bootstrap(applicationClass: ApplicationConstructor): ng.auto.IInjectorService;
export function bootstrap(moduleClass: ModuleConstructor, element: Element|Document): ng.auto.IInjectorService;
// export function bootstrap(moduleClass: ModuleConstructor, selector: string): ng.auto.IInjectorService;
export function bootstrap(moduleClass: ModuleConstructor, element?: Element|Document): ng.auto.IInjectorService {

    // Reflect.decorate apply decorators reversely, so we need to reverse
    // the extracted annotations before merging them
    // var aux = getAnnotations(moduleClass, ModuleAnnotation).reverse();
    var aux = getAnnotations(moduleClass, ModuleAnnotation);

    // TODO debug only?
    assert.notEmpty(aux, 'Missing @Application or @Module decoration');

    var annotation = <ApplicationAnnotation> mergeAnnotations({}, ...aux);

    element = element || annotation.element;

    // TODO debug only?
    assert(element, 'element must be provided');

    var ngModule = publishModule(moduleClass);

    return angular.bootstrap(<any> element, [ngModule.name]);

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