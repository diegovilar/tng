/// <reference path="../_references.ts" />

import {bind} from '../di'
import {makeDecorator, create, Map, forEach} from '../utils'
import {getAnnotations, mergeAnnotations} from '../reflection'


/// <reference path="../_references.ts" />
/**
 * @internal
 */
export class RoutesAnnotation {

    routes: Map<string|Function>;

    constructor(routes: Map<string|Function>) {
        this.routes = routes;
    }

}

type RoutesDecorator = (routes: Map<string|Function>) => ClassDecorator;

/**
 * A decorator to annotate a class with states
 */
export var Routes = <RoutesDecorator> makeDecorator(RoutesAnnotation);

/**
 * @internal
 */
export function registerRoutes(moduleController: Function, ngModule: ng.IModule) {

    // Reflect.decorate apply decorators reversely, so we need to reverse
    // the extracted annotations before merging them
    var notes = <RoutesAnnotation[]> getAnnotations(moduleController, RoutesAnnotation).reverse();

    if (!notes.length) return;

    var routes = {};
    notes.forEach((note) => mergeAnnotations(routes, note.routes));

    ngModule.config(bind(['$urlRouterProvider'], ($urlRouterProvider: ng.ui.IUrlRouterProvider) => {

        forEach(routes, (handler, route) => {
            if (route === '?') {
                $urlRouterProvider.otherwise(handler);
            }
            else {
                $urlRouterProvider.when(route, handler);
            }
        });

    }));

}