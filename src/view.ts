/// <reference path="./_references" />

import {makeDecorator, FunctionReturningString, setIfInterface} from './utils';

/**
 * Options available when decorating a class with view information
 * TODO document
 */
export interface ViewOptions {
    
    /**
     * TODO should it be required?
     */
    controllerAs?: string;
    
    /**
     * 
     */
    template?: string|FunctionReturningString;
    
    /**
     * 
     */
    templateUrl?: string|FunctionReturningString;
    
    /**
     * 
     */
    styleUrl?: string;
        
}

/**
 * @internal
 */
export class ViewAnnotation {

    template: string|FunctionReturningString = void 0;
    templateUrl: string|FunctionReturningString = void 0;
    styleUrl: string = void 0;
    controllerAs: string = void 0;

    constructor(options: ViewOptions) {
        setIfInterface(this, options);
    }

}

type ViewDecorator = (options: ViewOptions) => ClassDecorator;

/**
 * A decorator to annotate a controller with view information
 */
export var View = <ViewDecorator> makeDecorator(ViewAnnotation);