/// <reference path="../_references" />

import {Module} from 'tng/module';

export var constructorParameter: any;

@Module()
@Module({
	name: 'NamedModule'
})	
export class NamedModule {
	
	constructor(ngModule: any) {
		constructorParameter = ngModule;
	}
	
}