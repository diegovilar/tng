/// <reference path="../../_references.ts" />

import {makeDecorator, isNumber} from '../../utils'
import {getAnnotations} from '../../reflection'
import {injectable} from '../../di'



/**
 * Enumeration of events related to the transition of states.
 */
export const enum StateChangeEvent {

    /**
     * Fired when the transition begins.
     *
     * Translates to the UI-Router $stateChangeStart event.
     *
     * The $rootScope broadcasts this event down to child scopes.
     *
     * The handler function receives the following parameters:
     *
     * - event: ng.IAngularEvent
     * - toState:
     * - toParams:
     * - fromState:
     * - fromParams:
     *
     * Note: Use event.preventDefault() to prevent the transition from happening.
     */
    STATE_CHANGE_START,

    /**
     * Fired once the state transition is complete.
     *
     * Translates to the UI-Router $stateChangeSuccess event.
     *
     * The $rootScope broadcasts this event down to child scopes.
     *
     * The handler function receives the following parameters:
     *
     * - event: ng.IAngularEvent
     * - toState:
     * - toParams:
     * - fromState:
     * - fromParams:
     */
    STATE_CHANGE_SUCCESS,

    /**
     * Fired when an error occurs during transition.
     *
     * Translates to the UI-Router $stateChangeError event.
     *
     * The $rootScope broadcasts this event down to child scopes.
     *
     * The handler function receives the following parameters:
     *
     * - event: ng.IAngularEvent
     * - toState:
     * - toParams:
     * - fromState:
     * - fromParams:
     * - error: Error
     *
     * Note: It's important to note that if you have any errors in your
     * resolve functions (JavaScript errors, non-existent services, etc)
     * they will not throw traditionally. You must listen for this
     * event to catch ALL errors. Use event.preventDefault() to prevent
     * the $UrlRouter from reverting the URL to the previous valid location
     * (in case of a URL navigation).
     */
    STATE_CHANGE_ERROR

    /**
     * TODO: From version 0.3.0 and up. Does it have a stable release?
     *
     * Fired when a state cannot be found by its name.
     *
     * Translates to the UI-Router $stateNotFound event.
     *
     * The $rootScope broadcasts this event down to child scopes.
     */
    // STATE_NOT_FOUND

}

/**
 * Enumeration of events related to the loading of view contents.
 */
export const enum ViewLoadEvent {

    /**
     * Fired once the view begins loading, before the DOM is rendered.
     *
     * Translates to the UI-Router $viewContentLoading event.
     *
     * The $rootScope broadcasts this event down to child scopes.
     *
     * The handler function receives the following parameters:
     *
     * - event: ng.IAngularEvent
     * - viewConfig:
     */
    VIEW_CONTENT_LOADING = 4,

    /**
     * Fired once the view is loaded, after the DOM is rendered.
     *
     * Translates to the UI-Router $viewContentLoaded event.
     *
     * The '$scope' of the view emits the event up to the $rootScope.
     *
     * The handler function receives the following parameter:
     *
     * - event: ng.IAngularEvent
     */
    VIEW_CONTENT_LOADED = 5

}

/**
 * Maps the event enums to the actual event names used by the UI-Router.
 * @internal
 */
const EVENTS_MAP = [
    '$stateChangeStart',
    '$stateChangeSuccess',
    '$stateChangeError',
    '$stateNotFound',

    '$viewContentLoading',
    '$viewContentLoaded'
];

/**
 * @internal
 */
export class UiRouterEventListenerAnnotation {

    constructor(public event: StateChangeEvent|ViewLoadEvent|string, public handler: Function) {
        // TODO validate arguments
    }

}

/**
 * @internal
 */
type OnDecorator = (event: StateChangeEvent|ViewLoadEvent|string, handler: Function) => ClassDecorator;

/**
 * @internal
 */
export var On = <OnDecorator> makeDecorator(UiRouterEventListenerAnnotation);

/**
 * @internal
 */
export function publishListeners(moduleController: Function, ngModule: ng.IModule) {

    // Reflect.decorate apply decorators reversely, so we need to reverse
    // the extracted annotations to ge them on the original order
    var listenerNotes = <UiRouterEventListenerAnnotation[]> getAnnotations(moduleController, UiRouterEventListenerAnnotation).reverse();

    if (listenerNotes.length) {
        ngModule.run(injectable(['$rootScope'], ($rootScope: ng.IRootScopeService) => {

            for (let listenerAnnotation of listenerNotes) {
                let event = <string> listenerAnnotation.event;

                if (isNumber(event)) {
                    event = EVENTS_MAP[<number> listenerAnnotation.event];
                }

                $rootScope.$on(event, <any> listenerAnnotation.handler);
            }

        }));
    }
}