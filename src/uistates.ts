/// <reference path="./_references" />

import {bind} from './di';
import {makeDecorator, create, merge, isString, isFunction, Map, isArray, forEach} from './utils';
import {getAnnotations} from './reflection';
import {TemplateAnnotation} from './template';

/**
 * Options available when decorating a class with template information
 * TODO document
 */
export interface UIStateConfig {
    
    path: string;
    abstract?: boolean;
    view?: Function;
    views?: {[outlet:string]: Function};
    parent?: UIStateConfig|string;
    
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
export interface InternalUIStateConfig extends UIStateConfig {
    name: string;
}

/**
 * @internal
 */
export class UIStatesAnnotation {
    
    states: Map<InternalUIStateConfig>;

    constructor(states: Map<InternalUIStateConfig>) {
        
        forEach(states, (state, name) => state.name = name);
        this.states = states;
        
    }

}

type UIStatesDecorator = (states: Map<UIStateConfig>) => ClassDecorator;

/**
 * A decorator to annotate a class with states
 */
export var UIStates = <UIStatesDecorator> makeDecorator(UIStatesAnnotation);

/**
 * @internal
 */
export function registerStates(moduleController: Function, ngModule: ng.IModule) {
    
    var notes = <UIStatesAnnotation[]> getAnnotations(moduleController, UIStatesAnnotation);
        
    if (!notes.length) return;
    
    var states:InternalUIStateConfig[] = [];
    
    forEach(notes, (note) =>
        forEach(note.states, (state) =>
            states.push(state)));
    
    ngModule.config(bind(['$stateProvider'], ($stateProvider: ng.ui.IStateProvider) => {
        
        for (let state of states) {
            $stateProvider.state(translateToUiState(state));
        }
                
    })); 
    
}

function translateToUiState(state: InternalUIStateConfig): ng.ui.IState {
    
    var translatedState:ng.ui.IState = {};
    
    translatedState.name = state.name;
    translatedState.url = state.path;
    translatedState.abstract = state.abstract;
    translatedState.name = state.name;
    
    // If the state has a parent, we force the string way
    if (state.parent) {
        let parent = state.parent;
        if (!isString(parent)) {
            parent = (<InternalUIStateConfig> parent).name;
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
    
    let notes = getAnnotations(viewModel, TemplateAnnotation);
    
    if (!notes.length) {
        throw new Error('Template not defined');
    }
    
    let template = merge(create(TemplateAnnotation), ...notes);
    let data:any = {};
    
    data.controller = viewModel;
    data.controller = template.controllerAs;   
    data.template = template.inline;   
    data.templateUrl = template.url;
    // TODO style?
    
    return data;
    
}