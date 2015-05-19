import {makeDecorator, FunctionReturningSomething, setIfInterface} from '../utils';

export interface DecoratorOptions {
    name: string;
}

// @internal
export class DecoratorAnnotation {

    name: string = '';

    constructor(options: DecoratorOptions) {
        setIfInterface(this, options);
    }

}

export interface Decorator {
    decorate: FunctionReturningSomething;
}

export interface DecoratorConstructor extends Function {
    new (): Decorator;
}

type DecoratorSignature = (options: DecoratorOptions) => ClassDecorator;
export var Decorator = <DecoratorSignature> makeDecorator(DecoratorAnnotation);