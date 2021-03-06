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

import {ApplicationAnnotation, ApplicationConstructor} from './application';
import {DependenciesArray, ModuleAnnotation, ModuleConstructor, publishModule} from './module';
import {getAnnotations, mergeAnnotations} from './reflection';

// TODO debug only?
// import * as angular from "angular";
import {assert} from './assert';
import {create} from './utils';

export function bootstrap(application: Function, element?: Element|Document,
    dependencies?: DependenciesArray, constructorParameters?: any[]): ng.auto.IInjectorService {

    // Reflect.decorate apply decorators reversely, so we need to reverse
    // the extracted annotations before merging them
    // var aux = getAnnotations(moduleClass, ModuleAnnotation).reverse();
    var aux = getAnnotations(application, ModuleAnnotation);

    // TODO debug only?
    assert.notEmpty(aux, 'Missing @Application or @Module decoration');

    var annotation = <ApplicationAnnotation> mergeAnnotations({}, ...aux);

    element = element || annotation.element;

    // TODO debug only?
    assert(element, 'element must be provided');

    var ngModule = publishModule(<ModuleConstructor> application, null, dependencies, constructorParameters);

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