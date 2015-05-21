/// <reference path="./_references" />

import {makeDecorator, setIfInterface} from './utils';
import {ModuleOptions, ModuleAnnotation, Module, ModuleConstructor} from './module';

/**
 * Options available when decorating a class as an application
 * TODO document
 */
export interface ApplicationOptions extends ModuleOptions {
	selector: string;
}

/**
 * @internal
 */
export class ApplicationAnnotation extends ModuleAnnotation {

	selector: string = '';

	constructor(options: ApplicationOptions) {
		super(options);
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

type ApplicationSignature = (options: ApplicationOptions) => ClassDecorator;

/**
 * A decorator to annotate a class as being an application
 */
export var Application = <ApplicationSignature> makeDecorator(ApplicationAnnotation);