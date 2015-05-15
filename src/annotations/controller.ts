import {makeDecorator} from '../utils';

export interface ControllerOptions {
    
}

export class ControllerAnnotation {
    
    constructor(options:ControllerOptions) {
        
    }
    
}

type ControllerAnnotationDecorator = (options:ControllerOptions) => ClassDecorator;
export var Controller = <ControllerAnnotationDecorator> makeDecorator(ControllerAnnotation);
