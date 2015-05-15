/*
*/

import {makeDecorator} from '../utils';

export interface ModuleOptions {
	name:string;
	modules?:any[];
	components?:Function[];
	services?:Function[];
	directives?:Function[];
	controllers?:Function[];
}

export class ModuleAnnotation {
	
	name:string;
	modules:any[];
	components:Function[];
	services:Function[];
	directives:Function[];
    controllers:Function[];
	
	constructor(options:ModuleOptions) {
		this.name = options.name;
		this.modules = options.modules;
		this.components = options.components;
		this.services = options.services;
		this.directives = options.directives;
		this.controllers = options.controllers;
	}
	
}
	
type ModuleAnnotationDecorator = (options:ModuleOptions) => ClassDecorator;
export  var Module = <ModuleAnnotationDecorator> makeDecorator(ModuleAnnotation);
