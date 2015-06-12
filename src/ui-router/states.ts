/// <reference path="../_references" />

// TODO debug only?
import {assert} from '../assert';

import {bind} from '../di';
import {makeDecorator, create, isDefined, isString, isFunction, Map, isArray, forEach} from '../utils';
import {getAnnotations, mergeAnnotations} from '../reflection';
import {ViewAnnotation} from '../view';

/**
 * Options available when decorating an application controller with states
 * TODO document
 */
export interface StateConfig {
    
    url: string;
    abstract?: boolean;
    view?: Function;
    views?: {[outlet:string]: Function};
    parent?: StateConfig|string;
    
    // TODO
    // params
    // resolve
    // data
    // reloadOnSearch
    // onEnter
    // onExit
    
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

type EventHandler = (event: ng.IAngularEvent, ...args: any[]) => void;

export class UiRouterEventListenerAnnotation {
    
    constructor(public eventName: string, public handler: EventHandler) {
    }
    
}

export interface StatesDecorator {
    (states: Map<StateConfig>): ClassDecorator;
    on(eventName: string, handler: EventHandler): ClassDecorator;
}

/**
 * A decorator to annotate a class with states
 */
export var States = <StatesDecorator> <any> makeDecorator(StatesAnnotation);
States.on = makeDecorator(UiRouterEventListenerAnnotation);

/**
 * @internal
 */
export function publishStates(moduleController: Function, ngModule: ng.IModule) {
    
    // Reflect.decorate apply decorators reversely, so we need to reverse
    // the extracted annotations before merging them
    var statesAnnotation = <StatesAnnotation[]> getAnnotations(moduleController, StatesAnnotation).reverse();
    var listenerNotes = <UiRouterEventListenerAnnotation[]> getAnnotations(moduleController, UiRouterEventListenerAnnotation).reverse();
        
    if (statesAnnotation.length) {
        let states: ng.ui.IState[] = [];

        forEach(statesAnnotation, (note) =>
            forEach(note.states, (state) =>
                states.push(translateToUiState(state))));

        ngModule.config(bind(['$stateProvider'], ($stateProvider: ng.ui.IStateProvider) => {

            for (let state of states) {
                $stateProvider.state(state);
            }

        }));
    }
    
    if (listenerNotes.length) {        
        ngModule.run(bind(['$rootScope'], ($rootScope: ng.IRootScopeService) => {

            for (let listenerAnnotation of listenerNotes) {
                $rootScope.$on(listenerAnnotation.eventName, listenerAnnotation.handler);
            }

        }));
    }
    
}

/**
 * @internal
 */
function translateToUiState(state: InternalStateConfig): ng.ui.IState {
    
    var translatedState:ng.ui.IState = {};
    
    if (isDefined(state.name)) translatedState.name = state.name;
    if (isDefined(state.url)) translatedState.url = state.url;
    if (isDefined(state.abstract)) translatedState.abstract = state.abstract;
    
    // If the state has a parent, we force the string way
    if (isDefined(state.parent)) {
        let parent = state.parent;
        if (!isString(parent)) {
            parent = (<InternalStateConfig> parent).name;
        }
        // ng.ui.IState is missing parent
        (<any> translatedState).parent = parent;
    }
        
    if (state.view && state.views) {
        throw Error('Cannot provide both view and views');
    }
    else if (!state.view && !state.views) {
        throw Error('Must provide either view or views');
    }
    else {
        let views = <{[key:string]:any}> {};
        
        if (state.view) {
            views[''] = extractViewData(state.view);
        }
        else {
            forEach(state.views, (controller, outlet) => views[outlet] = extractViewData(controller))
        }
        
        translatedState.views = views;    
    }

    return translatedState;

}

/**
 * @internal
 */
function extractViewData(viewModel: Function) {
    
    // Reflect.decorate apply decorators reversely, so we need to reverse
    // the extracted annotations before merging them
    let notes = getAnnotations(viewModel, ViewAnnotation).reverse();
    
    if (!notes.length) {
        throw new Error('Template not defined');
    }
    
    let template = <ViewAnnotation> mergeAnnotations({}, ...notes);
    let data:any = {};
    
    data.controller = viewModel;
    if (template.controllerAs) data.controllerAs = template.controllerAs;    
    if (template.template) data.template = template.template;
    if (template.templateUrl) data.templateUrl = template.templateUrl;
    // TODO style?
    
    return data;
    
}