import {makeDecorator} from '../utils';

interface ComponentOptions {
    selector:string;
}

class ComponentAnnotation {
    
    selector:string;
    
    constructor(options:ComponentOptions) {
        this.selector = options.selector;
    }
    
}

type ComponentAnnotationConstructor = (options:ComponentOptions) => ClassDecorator;
var Component = <ComponentAnnotationConstructor> makeDecorator(ComponentAnnotation);

export {
    ComponentOptions,
    ComponentAnnotation,
    Component
};
