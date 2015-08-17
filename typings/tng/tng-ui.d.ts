/// <reference path="./tng.d.ts" />
/// <reference path="../angular-ui-router/angular-ui-router.d.ts" />
/// <reference path="../angular-ui-bootstrap/angular-ui-bootstrap.d.ts" />



// ----------------------------------------------------------------------------
// UI-Router
// ----------------------------------------------------------------------------

declare module "tng/ui/router/states" {

    type StateConfigMap = { [stateName: string]: StateConfig };

    export {View, ViewOptions} from 'tng/view'

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
	 * Options available when decorating an application controller with states
	 * TODO document
	 */
	export interface StateConfig {
	    url: string;
	    abstract?: boolean;
	    view?: Function;
	    views?: {[outlet: string]: Function};
		modal?: Function;
	    parent?: StateConfig|string;
		reloadOnSearch?: boolean;
		onEnter?: Function;
		onExit?: Function;
		resolve?: {[key: string]: string|Function};
    }

    export interface StatesDecorator {
        /**
         * Decorates a module with states.
         */
        (states: StateConfigMap): ClassDecorator;

        /**
         * Add a listener to a given UI-Router emitted events.
         * @param event The event to listen to
         * @param handler The function to invoke when the event is fired
         */
        on(event: StateChangeEvent|ViewLoadEvent|string, handler: Function): ClassDecorator;
    }

	/**
	 * A decorator to annotate a class with states
	 */
    export var States: StatesDecorator;

}

declare module "tng/ui/router/routes" {

	type RoutesMap = {[route: string]: string|Function};

	/**
	 * A decorator to annotate with routes
	 */
	function Routes(routes: RoutesMap): ClassDecorator;

}



// ----------------------------------------------------------------------------
// UI-Bootstrap
// ----------------------------------------------------------------------------

declare module "tng/ui/bootstrap" {

	export class TngUiBootstrapModule {

    }

}

declare module "tng/ui/bootstrap/modal" {

    import {ViewOptions} from "tng/view"
	import IModalScope = angular.ui.bootstrap.IModalScope
	// type StringMap = {[key: string]: string};

	export enum ModalBackdrop {
		Show,
		Hide,
		Static
	}

	/**
	 * Options available when decorating a component with view information
	 * TODO document
	 */
	export interface ModalViewOptions extends ViewOptions {

		animation?: boolean;
		backdrop?: ModalBackdrop;
		backdropClass?: string;
		keyboard?: boolean;
		windowClass?: string;
		windowTemplateUrl?: string;
		size?: string;

	}

	/**
	 * A decorator to annotate a component with view information
	 */
	function ModalView(options: ModalViewOptions): ClassDecorator;

	/**
	 * TODO document
	 */
	export interface ModalOptions {

		scope?: ng.IScope|IModalScope|{(...args: any[]): ng.IScope|IModalScope};
	    bindToController?: boolean;
		// resolve?: {[key: string]: string|Function}; // It doesn't really support strings, as stated in the docs
		resolve?: {[key: string]: Function};
		keyboard?: boolean;
		dismissAll?: boolean;

	}

	/**
	 * Interface components MAY implement
	 */
	export interface Modal {

	}

	/**
	 * A decorator to annotate a class as being a component controller
	 */
	function Modal(options?: ModalOptions): ClassDecorator;

}

declare module angular.ui.bootstrap {

	interface IModalService {
        /**
         * @param {Function} modal
         * @returns {IModalServiceInstance}
         */
        open(modal: Function): IModalServiceInstance;
    }

}