import {makeDecorator, FunctionReturningString, setIfInterface} from '../utils';

export const enum TemplateNamespace {
    HTML,
    SVG,
    MathML
}

export interface ViewOptions {
    controllerAs: string;
    template?: string|FunctionReturningString;
    templateUrl?: string|FunctionReturningString;
    style?: string;
    styleUrl?: string;
    templateNamespace?: TemplateNamespace;
}

// @internal
export class ViewAnnotation {

    template: string|FunctionReturningString = '';
    templateUrl: string|FunctionReturningString = '';
    style = '';
    styleUrl = '';
    controllerAs = '';
    templateNamespace = TemplateNamespace.HTML;

    constructor(options: ViewOptions) {
        setIfInterface(this, options);
    }

}

type ViewDecorator = (options: ViewOptions) => ClassDecorator;
export var View = <ViewDecorator> makeDecorator(ViewAnnotation);