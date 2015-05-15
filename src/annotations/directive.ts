/// <reference path="../_references" />

/*
@DirectiveComponent({
    selector: 'card',
    restrict: Restriction.Element
    scope:{},
    bindToController: {
        title: '@'
    }
})
@DirectiveView({
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
import {ComponentOptions, ComponentAnnotation} from './component';

export const enum Restriction {
    Attribute,
    Element,
    Class,
    Comment
}
const restrictionMap = {
    [Restriction.Attribute]: 'A',
    [Restriction.Element]: 'E',
    [Restriction.Class]: 'C',
    [Restriction.Comment]: 'M'
};

export const enum Transclusion {
    Content,
    Element
}
const transclusionMap = {
    [Transclusion.Content]: true,
    [Transclusion.Element]: 'element'
};

export interface DirectiveOptions extends ComponentOptions {

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
    
    // needs mapping
    restrict?: Restriction|Restriction[]; // [Restriction.Element, Restriction.Element]
    
    // needs mapping
    transclude?: Transclusion; // Transclusion.Content
    
    // Metodos estático?
    compile?: any;
    link?: any;
    
    // deprecated
    replace?: boolean;

}

// @internal
export class DirectiveAnnotation extends ComponentAnnotation {

    constructor(options: DirectiveOptions) {
        super(options);
    }

}

type DirectiveDecorator = (options: DirectiveOptions) => ClassDecorator;
export var Directive = <DirectiveDecorator> makeDecorator(DirectiveAnnotation);

// Alias for simplicity
export {Directive as DirectiveComponent}

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
