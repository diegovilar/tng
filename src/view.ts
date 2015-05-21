/// <reference path="./_references" />

import {makeDecorator, FunctionReturningString, setIfInterface} from './utils';

/**
 * TODO document
 */
export const enum TemplateNamespace {
    HTML,
    SVG,
    MathML
}

/**
 * Options available when decorating a class with view information
 * TODO document
 */
export interface ViewOptions {
    
    /**
     * 
     */
    controllerAs: string;
    
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
    style?: string;
    
    /**
     * 
     */
    styleUrl?: string;
    
    /**
     * 
     */
    templateNamespace?: TemplateNamespace;
    
    /**
     * @deprecated
     */
    replace?: boolean;
}

/**
 * @internal
 */
export class ViewAnnotation {

    template: string|FunctionReturningString = '';
    templateUrl: string|FunctionReturningString = '';
    style = '';
    styleUrl = '';
    controllerAs = '';
    templateNamespace = TemplateNamespace.HTML;
    replace = false;

    constructor(options: ViewOptions) {
        setIfInterface(this, options);
    }

}

type ViewDecorator = (options: ViewOptions) => ClassDecorator;

/**
 * A decorator to annotate a class with view information
 */
export var View = <ViewDecorator> makeDecorator(ViewAnnotation);