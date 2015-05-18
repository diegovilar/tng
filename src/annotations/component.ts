/// <reference path="../_references" />

/*
@Component({
    selector: 'card',
    restrict: Restriction.Element
    scope:{},
    bindToController: {
        title: '@'
    }
})
@View({
    controllerAs: 'card'
    template: "<div>I'm a card</div>",
    styleUrl: 'card.css'
})
class Card {

    constructor(@Inject('$scope') private $scope, @Inject('$element') private $element,
                @Inject('$attrs') private $attrs, @Inject('$transclude') private $transclude) {        
    }
    
    static template():string {
    }
    
    static templateUrl():string {
    }

    static compile() {
    }
    
    static link() {
    }

}
*/

import {Inject} from './inject';
import {makeDecorator, Map, FunctionReturningString} from '../utils';

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

export interface Component {

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
    
    // Metodos estático?
    compile?: any;
    link?: any;
    
    // deprecated
    replace?: boolean;

}

// @internal
export class ComponentAnnotation {

    constructor(options: Component) {
    }

}

type ComponentDecorator = (options: Component) => ClassDecorator;
export var Component = <ComponentDecorator> makeDecorator(ComponentAnnotation);

// @internal
export interface DirectiveClass extends Function {
    templateFactory?: FunctionReturningString;
    templateUrlFactory?: FunctionReturningString;
}

// @internal
export function makeDirectiveFactory(DirectiveClass: DirectiveClass):Function {

    return Inject(['$injector'], function directiveFactory($injector: ng.auto.IInjectorService): ng.IDirective {

        return null;

    });

}
