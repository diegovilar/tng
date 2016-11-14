import {injectable} from '../../di'
import {makeDecorator, create, Map, forEach} from '../../utils'
import {getAnnotations, mergeAnnotations} from '../../reflection'



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
    // var notes = <RoutesAnnotation[]> getAnnotations(moduleController, RoutesAnnotation).reverse();
    var notes = <RoutesAnnotation[]> getAnnotations(moduleController, RoutesAnnotation);

    if (!notes.length) return;

    var routes = {};
    notes.forEach((note) => mergeAnnotations(routes, note.routes));

    ngModule.config(injectable(['$urlRouterProvider'], ($urlRouterProvider: ng.ui.IUrlRouterProvider) => {

        forEach(routes, (handler, route) => {
            if (route === '?') {
                $urlRouterProvider.otherwise(<any> handler);
            }
            else {
                $urlRouterProvider.when(route, <any> handler);
            }
        });

    }));

}