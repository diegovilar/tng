import {Inject} from './inject';
import {makeDecorator, Map, setIfInterface} from '../utils';
import {FunctionReturningString, FunctionReturningNothing} from '../utils';

//export const enum Restriction {
//    Attribute,
//    Element,
//    Class,
//    Comment
//}
//const restrictionMap = {
//    [Restriction.Attribute]: 'A',
//    [Restriction.Element]: 'E',
//    [Restriction.Class]: 'C',
//    [Restriction.Comment]: 'M'
//};

export const enum Transclusion {
    Content,
    Element
}
const transclusionMap = {
    [Transclusion.Content]: true,
    [Transclusion.Element]: 'element'
};

type PrePost = {
    pre : FunctionReturningNothing,
    post: FunctionReturningNothing
};
type CompileFunction = (...args: any[]) => FunctionReturningNothing;
type FunctionReturningPrePost = (...args: any[]) => PrePost;

export interface ComponentOptions {

    // name = element
    // .name = class
    // [name] = attribute
    // //name = comment
    selector: string;
    
    multiElement?: boolean;
    priority?: number;
    terminal?: boolean;
    
    // TODO Como simplificar
    // TODO depende de controllerAs?
    // TODO como realmente funciona bindToController no 1.4? Nas docs,
    //      ainda esta como boolean apenas, mas parece que pode ser um Map
    scope?: boolean|Map<string>;
    bindToController?: boolean|Map<string>;

    require?: string[];
    
    // TODO inferir pelo seletor
    // needs mapping
    //restrict?: Restriction|Restriction[]; // [Restriction.Element, Restriction.Element]
    
    // needs mapping
    transclude?: Transclusion; // Transclusion.Content
        
    compile?: CompileFunction|FunctionReturningPrePost;
    link?: FunctionReturningNothing|PrePost;
    
    // deprecated
    replace?: boolean;

}

// @internal
export class ComponentAnnotation {

    constructor(options: ComponentOptions) {
        setIfInterface(this, options);
    }

}

type ComponentDecorator = (options: ComponentOptions) => ClassDecorator;
export var Component = <ComponentDecorator> makeDecorator(ComponentAnnotation);

// TODO extract?
// @internal
export function makeDirectiveFactory(DirectiveClass: Function):Function {

    return Inject(['$injector'], function directiveFactory($injector: ng.auto.IInjectorService): ng.IDirective {

        return null;

    });

}
