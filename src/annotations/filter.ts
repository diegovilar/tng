import {makeDecorator, FunctionReturningSomething, setIfInterface} from '../utils';

export interface FilterOptions {
    name: string;
}

// @internal
export class FilterAnnotation {

    name: string = '';

    constructor(options: FilterOptions) {
        setIfInterface(this, options);
    }

}

export interface Filter {
    filter:(input: any, ...args: any[]) => any;
}

type FilterSignature = (options: FilterOptions) => ClassDecorator;
export var Filter = <FilterSignature> makeDecorator(FilterAnnotation);