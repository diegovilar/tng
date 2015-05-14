/*
*/

import {makeDecorator} from '../utils';

interface ModuleOptions {
	name:string;
	modules?:any[];
	components?:Function[];
	services?:Function[];
	directives?:Function[];
}

class ModuleAnnotation {
	
	name:string;
	modules:any[];
	components:Function[];
	services:Function[];
	directives:Function[];
	
	constructor(options:ModuleOptions) {
		this.name = options.name;
		this.modules = options.modules;
		this.components = options.components;
		this.services = options.services;
		this.directives = options.directives;
	}
	
}
	
type ModuleAnnotationConstructor = (options:ModuleOptions) => ClassDecorator;
var Module = <ModuleAnnotationConstructor> makeDecorator(ModuleAnnotation);

export {
    ModuleOptions,
    ModuleAnnotation,
    Module
};
