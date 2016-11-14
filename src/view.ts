// TODO debug only?
import {assert} from './assert'
import {makeDecorator, FunctionReturningString, setIfInterface} from './utils'



/**
 * Options available when decorating a class with view information
 * TODO document
 */
export interface ViewOptions {

    /**
     * TODO should it be required?
     */
    controllerAs: string;

    /**
     *
     */
    template?: string|FunctionReturningString;

    /**
     *
     */
    templateUrl?: string|FunctionReturningString;

    /**
     * TODO
     */
    styles?: string|string[];

    /**
     * TODO
     */
    // stylesUrls?: string[];

}

/**
 * @internal
 */
export class ViewAnnotation {

    template: string|FunctionReturningString = void 0;
    templateUrl: string|FunctionReturningString = void 0;
    styles: string|string[] = void 0;
    // stylesUrls: string[] = void 0;
    controllerAs: string = void 0;

    constructor(options: ViewOptions) {
        // TODO debug only?
        assert.notNull(options, 'options must not be null');
        assert.notEmpty(options.controllerAs, 'controllerAs cannot be null or empty');

        setIfInterface(this, options);
    }

}

/**
 * @internal
 */
type ViewDecorator = (options: ViewOptions) => ClassDecorator;

/**
 * A decorator to annotate a controller with view information
 */
export var View = <ViewDecorator> makeDecorator(ViewAnnotation);