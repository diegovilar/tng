import {makeDecorator} from '../utils';
import {ControllerOptions, ControllerAnnotation} from './controller';

export interface ComponentOptions extends ControllerOptions {    
    selector: string;    
}

export class ComponentAnnotation extends ControllerAnnotation {

    selector: string;

    constructor(options: ComponentOptions) {
        super(options);
        this.selector = options.selector;
    }

}

type ComponentDecorator = (options: ComponentOptions) => ClassDecorator;
export var Component = <ComponentDecorator> makeDecorator(ComponentAnnotation);
