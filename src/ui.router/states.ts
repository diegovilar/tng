// TODO debug only?
import {$$assert, $$reflection, $$utils, View, ViewAnnotation, injectable, safeBind} from "angularts.core";
import {On, publishListeners} from "./events";

import {UIRouterService} from "./router-service";
import {getModalHandler} from "angularts.ui.bootstrap";

import Map = $$utils.Map;
let isDefined = $$utils.isDefined;
let isString = $$utils.isString;
let forEach = $$utils.forEach;

export const DISMISSED_BY_ROUTER = "DISMISS_BY_ROUTER";
const LOGID = "angularts.ui.router";

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
    resolve?: Map<string|Function>;

    // TODO
    // params
    // data

}

/**
 * @internal
 */
export interface InternalStateConfig extends StateConfig {
    name: string;
}

/**
 * @internal
 */
export class StatesAnnotation {

    states: Map<InternalStateConfig>;

    constructor(states: Map<InternalStateConfig>) {

        forEach(states, (state, name) => state.name = name);
        this.states = states;

    }

}

export interface StatesDecorator {
    (states: Map<StateConfig>): ClassDecorator;
    on: typeof On;
}

/**
 * A decorator to annotate a class with states
 */
export var States = <StatesDecorator> <any> $$reflection.makeDecorator(StatesAnnotation);
States.on = On;

/**
 * @internal
 */
export function publishStates(moduleController: Function, ngModule: ng.IModule) {

    // Reflect.decorate apply decorators reversely, so we need to reverse
    // the extracted annotations to ge them on the original order
    // var statesAnnotation = <StatesAnnotation[]> getAnnotations(moduleController, StatesAnnotation).reverse();
    let statesAnnotation = <StatesAnnotation[]> $$reflection.getAnnotations(moduleController, StatesAnnotation);

    if (statesAnnotation.length) {
        let states: ng.ui.IState[] = [];

        // Translate each state from each annotation and stack them in an array
        forEach(statesAnnotation, (note) =>
            forEach(note.states, (state) =>
                states.push(translateToUiState(state))));

        ngModule.config(injectable(["$stateProvider"], ($stateProvider: ng.ui.IStateProvider) => {

            for (let state of states) {
                $stateProvider.state(state);
            }

        }));
    }

    publishListeners(moduleController, ngModule);

}

/**
 * @internal
 */
function translateToUiState(state: InternalStateConfig): ng.ui.IState {

    let translatedState: ng.ui.IState = {};

    if (isDefined(state.name)) translatedState.name = state.name;
    if (isDefined(state.url)) translatedState.url = state.url;
    if (isDefined(state.abstract)) translatedState.abstract = state.abstract;
    if (isDefined(state.reloadOnSearch)) translatedState.reloadOnSearch = state.reloadOnSearch;
    if (isDefined(state.onEnter)) translatedState.onEnter = state.onEnter;
    if (isDefined(state.onExit)) translatedState.onExit = state.onExit;
    if (isDefined(state.resolve)) translatedState.resolve = state.resolve;

    // If the state has a parent, we force the string way
    if (isDefined(state.parent)) {
        let parent = state.parent;
        if (!isString(parent)) {
            parent = (<InternalStateConfig> parent).name;
        }
        // ng.ui.IState is missing parent
        (<any> translatedState).parent = parent;
    }

    // if (state.view && state.views) {
    //     throw Error('Cannot provide both view and views');
    // }
    // else if (!state.view && !state.views) {
    //     throw Error('Must provide either view or views');
    // }
    // else {
    if (state.view || state.views) {
        let views = <{[key: string]: any}> {};

        if (state.view) {
            views[""] = extractViewData(state.view);
        }
        else {
            forEach(state.views, (controller, outlet) => views[outlet] = extractViewData(controller));
        }

        translatedState.views = views;
    }
    else if (state.modal) {
        let handler = getModalHandler(state.modal);

        let onEnter = <Function> translatedState.onEnter;
        translatedState.onEnter = injectable(["$injector", "$uirouter", "$state"], ($injector: ng.auto.IInjectorService, $uirouter: UIRouterService, $state: any) => {

            if (onEnter) {
                $injector.invoke(onEnter);
            }

            console.info(`${LOGID} >> Opening modal for state "${$state.$current.name}"`);
            let modal = <ng.ui.bootstrap.IModalServiceInstance> $injector.invoke(handler.open, handler, {dismissReason: ""});

            modal.result.finally(() => {
                if (!$uirouter.isRouting) {
                    console.info(`${LOGID} >> Routing to parent of state "${$state.$current.name}" after modal closed/dismissed`);
                    $state.go("^");
                }
            });

        });

        let onExit = <Function> translatedState.onExit;
        translatedState.onExit = injectable(["$injector", "$state"], ($injector: ng.auto.IInjectorService, $state: any) => {

            console.info(`${LOGID} >> Dismising modal after leaving state "${$state.$current.name}"`);
            $injector.invoke(handler.dismiss, handler, {reason: DISMISSED_BY_ROUTER});

            if (onExit) {
                $injector.invoke(onExit);
            }

        });
    }

    return translatedState;

}

/**
 * @internal
 */
function extractViewData(viewModel: Function) {

    // Reflect.decorate apply decorators reversely, so we need to reverse
    // the extracted annotations before merging them
    // let notes = getAnnotations(viewModel, ViewAnnotation).reverse();
    let notes = $$reflection.getAnnotations(viewModel, ViewAnnotation);

    if (!notes.length) {
        throw new Error("Template not defined");
    }

    let template = <ViewAnnotation> $$reflection.mergeAnnotations({}, ...notes);
    let data: any = {};

    data.controller = viewModel;
    if (template.controllerAs) data.controllerAs = template.controllerAs;
    if (template.template) data.template = template.template;
    if (template.templateUrl) data.templateUrl = template.templateUrl;
    // TODO style?

    return data;

}