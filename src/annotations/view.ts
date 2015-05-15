/*
Resultdo esperado:

Uso em construtor da classe:
	@View({})
    class MyClass {
	}

MyClass.annotations = ['injectable1', 'injectable2'];
*/

import {makeDecorator} from '../utils';

export interface ViewOptions {
    template?:string;
	templateUrl?:string;
	style?:string;
	styleUrl?:string;
    controllerAs?:string;
}

export class ViewAnnotation {
    
    template:string;
    templateUrl:string;
    style:string;
    styleUrl:string;
    controllerAs:string;
    
    constructor(options:ViewOptions) {
        this.templateUrl = options.templateUrl;
        this.template = options.template;
        this.style = options.style;
        this.styleUrl = options.styleUrl;
        this.controllerAs = options.controllerAs;
    }
    
}

type ViewAnnotationConstructor = (options:ViewOptions) => ClassDecorator;
export var View = <ViewAnnotationConstructor> makeDecorator(ViewAnnotation);
