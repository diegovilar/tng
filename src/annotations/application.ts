import {makeDecorator, setIfInterface} from '../utils';
import {ModuleOptions, ModuleAnnotation, Module, ModuleConstructor} from './module';

export interface ApplicationOptions extends ModuleAnnotation {
	selector: string;
}

export class ApplicationAnnotation extends ModuleAnnotation {

	selector: string = '';

	constructor(options: ApplicationOptions) {
		super(options);
		setIfInterface(this, options);
	}

}

export interface Application extends Module {

}

export interface ApplicationConstructor extends ModuleConstructor {

}

type ApplicationSignature = (options: ApplicationOptions) => ClassDecorator;
export var Application = <ApplicationSignature> makeDecorator(ApplicationAnnotation);