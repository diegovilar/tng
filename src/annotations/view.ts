import {makeDecorator, FunctionReturningString} from '../utils';

export const enum TemplateNamespace {
    HTML,
    SVG,
    MathML
}

export interface ViewOptions {
    controllerAs:string;
    template?:string;
	templateUrl?:string;
	style?:string;
	styleUrl?:string;
    templateNamespace?: string;
}

export class ViewAnnotation {
    
    template:string;
    templateUrl:string;
    style:string;
    styleUrl:string;
    controllerAs:string;
    templateNamespace: string; // TemplateNamespace.HTML
    
    constructor(options:ViewOptions) {
        this.template = options.template;
        this.templateUrl = options.templateUrl;
        this.style = options.style;
        this.styleUrl = options.styleUrl;
        this.controllerAs = options.controllerAs;
        this.templateNamespace = options.templateNamespace;
    }
    
}

type ViewDecorator = (options:ViewOptions) => ClassDecorator;
export var View = <ViewDecorator> makeDecorator(ViewAnnotation);
