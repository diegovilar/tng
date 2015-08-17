/// <reference path="./_references.ts" />

// TODO debug only?
import {assert} from './assert'
import {makeDecorator, setIfInterface, isElement} from './utils'
import {ModuleOptions, ModuleAnnotation, Module, ModuleConstructor} from './module'



/**
 * Options available when decorating a class as an application
 * TODO document
 */
export interface ApplicationOptions extends ModuleOptions {
	// selector?: string;
	element: Element
}

/**
 * @internal
 */
export class ApplicationAnnotation extends ModuleAnnotation {

	// selector: string = void 0;
	element: Element|Document = void 0;

	constructor(element: Element|Document);
	constructor(options: ApplicationOptions);
	constructor(elementOroptions: any) {
		super(options);

		var options = isElement(elementOroptions) ? { element: elementOroptions } : elementOroptions;

		// TODO debug only?
        assert(options && options.element, 'element must be provided');
        // assert(options.element || options.selector, 'Either element or selector must be provided');
		// assert(!(options.element && options.selector), 'Provide either selector or element, but not both');

		setIfInterface(this, options);
	}

}

/**
 * Interface applications MAY implement
 */
export interface Application extends Module {

}

/**
 * @internal
 */
export interface ApplicationConstructor extends ModuleConstructor {

}

/**
 * @internal
 */
type ApplicationSignature = (options: ApplicationOptions) => ClassDecorator;

/**
 * A decorator to annotate a class as being an application
 */
export var Application = <ApplicationSignature> makeDecorator(ApplicationAnnotation);