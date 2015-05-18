import {makeDecorator, setIfInterface, FunctionReturningNothing} from '../utils';

export interface ModuleOptions {
	dependencies?: (string|Function)[];
	config?: Function|Function[];
	run?: Function|Function[];
	
	name?: string;
	modules?: (string|Function)[];
	components?: Function[];
	services?: Function[];
	filters?: Function[];
	decorators?: Function[];
	animations?: Function[];
	values?: Function[];
	constants?: Function[];
}

export class ModuleAnnotation {

	dependencies: (string|Function)[] = null;
	config: Function|Function[] = null;
	run: Function|Function[] = null;

	name: string = '';
	modules: (string|Function)[] = null;
	components: Function[] = null;
	services: Function[] = null;
	filters: Function[] = null;
	decorators: Function[] = null;
	animations: Function[] = null;
	values: Function[] = null;
	constants: Function[] = null;

	constructor(options: ModuleOptions) {
		setIfInterface(this, options);
	}

}

export interface Module {
	onConfig?: FunctionReturningNothing;
	onRun?: FunctionReturningNothing;
}

type ModuleSignature = (options: ModuleOptions) => ClassDecorator;
export var Module = <ModuleSignature> makeDecorator(ModuleAnnotation);