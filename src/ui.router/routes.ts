import {$$reflection, injectable, $$utils as utils} from 'angularts.core';

import Map = utils.Map;

/**
 * @internal
 */
export class RoutesAnnotation {

    routes: utils.Map<string|Function>;

    constructor(routes: Map<string|Function>) {
        this.routes = routes;
    }

}

type RoutesDecorator = (routes: Map<string|Function>) => ClassDecorator;

/**
 * A decorator to annotate a class with states
 */
export var Routes = <RoutesDecorator> $$reflection.makeDecorator(RoutesAnnotation);

/**
 * @internal
 */
export function registerRoutes(moduleController: Function, ngModule: ng.IModule) {

    // Reflect.decorate apply decorators reversely, so we need to reverse
    // the extracted annotations before merging them
    // var notes = <RoutesAnnotation[]> getAnnotations(moduleController, RoutesAnnotation).reverse();
    var notes = <RoutesAnnotation[]> $$reflection.getAnnotations(moduleController, RoutesAnnotation);

    if (!notes.length) return;

    var routes = {};
    notes.forEach((note) => $$reflection.mergeAnnotations(routes, note.routes));

    ngModule.config(injectable(['$urlRouterProvider'], ($urlRouterProvider: ng.ui.IUrlRouterProvider) => {

        utils.forEach(routes, (handler, route) => {
            if (route === '?') {
                $urlRouterProvider.otherwise(<any> handler);
            }
            else {
                $urlRouterProvider.when(route, <any> handler);
            }
        });

    }));

}