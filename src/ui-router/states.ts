/// <reference path="../_references" />

import {bind} from '../di';
import {makeDecorator, create, merge, isString, isFunction, Map, isArray, forEach} from '../utils';
import {getAnnotations} from '../reflection';
import {ViewAnnotation} from '../view';

/**
 * Options available when decorating an application controller with states
 * TODO document
 */
export interface StateConfig {
    
    path: string;
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

type StatesDecorator = (states: Map<StateConfig>) => ClassDecorator;

/**
 * A decorator to annotate a class with states
 */
export var States = <StatesDecorator> makeDecorator(StatesAnnotation);

/**
 * @internal
 */
export function registerStates(moduleController: Function, ngModule: ng.IModule) {
    
    var notes = <StatesAnnotation[]> getAnnotations(moduleController, StatesAnnotation);
        
    if (!notes.length) return;
    
    var states:InternalStateConfig[] = [];
    
    forEach(notes, (note) =>
        forEach(note.states, (state) =>
            states.push(state)));
    
    ngModule.config(bind(['$stateProvider'], ($stateProvider: ng.ui.IStateProvider) => {
        
        for (let state of states) {
            $stateProvider.state(translateToUiState(state));
        }
                
    })); 
    
}

function translateToUiState(state: InternalStateConfig): ng.ui.IState {
    
    var translatedState:ng.ui.IState = {};
    
    translatedState.name = state.name;
    translatedState.url = state.path;
    translatedState.abstract = !!state.abstract;
    
    // If the state has a parent, we force the string way
    if (state.parent) {
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

function extractViewData(viewModel: Function) {
    
    let notes = getAnnotations(viewModel, ViewAnnotation);
    
    if (!notes.length) {
        throw new Error('Template not defined');
    }
    
    let template = merge(create(ViewAnnotation), ...notes);
    let data:any = {};
    
    data.controller = viewModel;
    data.controllerAs = template.controllerAs;   
    data.template = template.template;   
    data.templateUrl = template.templateUrl;
    // TODO style?
    
    return data;
    
}