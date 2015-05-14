/*
Resultdo esperado:

Uso em construtor da classe:
	@View({})
    class MyClass {
	}

MyClass.annotations = ['injectable1', 'injectable2'];
*/

import {makeDecorator} from '../utils'

interface ViewOptions {
    template?:string;
	templateUrl?:string;
	style?:string;
	styleUrl?:string;
    //renderer?:Function;
}

class ViewAnnotation implements ViewOptions {
    
    template:string;
    templateUrl:string;
    style:string;
    styleUrl:string;
    
    constructor(options:ViewOptions) {
        this.templateUrl = options.templateUrl;
        this.template = options.template;
        this.style = options.style;
        this.styleUrl = options.styleUrl;
    }
    
}

type ViewAnnotationConstructor = (options:ViewOptions) => ClassDecorator;
var View = <ViewAnnotationConstructor> makeDecorator(ViewAnnotation);

export {
    ViewOptions,
    ViewAnnotation,
    View
};
