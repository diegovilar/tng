import {makeDecorator, setIfInterface} from '../utils';

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

// constructor is injectable
export interface Filter {
    
    // not injectable
    filter: (input: any, ...args: any[]) => any;
}

export interface FilterConstructor extends Function {
    new (): Filter;
    prototype: Filter;
}

type FilterSignature = (options: FilterOptions) => ClassDecorator;
export var Filter = <FilterSignature> makeDecorator(FilterAnnotation);