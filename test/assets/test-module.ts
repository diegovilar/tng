/// <reference path="../_references" />

import {Module} from 'tng/module';

// --

export var constructorParameter: any;

@Module({
	name: 'NamedModule'
})	
export class NamedModule {
	
	constructor(ngModule: any) {
		constructorParameter = ngModule;
	}
	
}

// --

@Module()
export class AnnonymousModule {
	
}

// --

import * as constants from './test-constant';
import * as values from './test-value';
import * as services from './test-service';
import * as components from './test-component';
import * as directives from './test-directive';

@Module()
class DepModule{}

@Module({
	dependencies: [
		constants.wrappedConstant,
		values.wrappedValue,
		services.TestService,
		directives.TestDirective,
		components.TestComponent,
		DepModule
	]
})
export class ModuleWithDependencies {}

// --

@Module()
export class InnerModule{}

@Module({
	dependencies: [
		DepModule
	]
})
export class OutterModule {}

// --

@Module({
	dependencies: [
		function(){}
	]
})
export class ModuleWithInvalidDependencies {}

// --

@Module({
	config: function(){}
})
export class ModuleWithConfigDecoration{}

// --

@Module()
export class ModuleWithConfigImplementation {
	
	onConfig() {
	}
	
}

// --

var configCallOrder: string[] = [];
export {configCallOrder};

@Module({
	name: 'ModuleWithConfigDecorationAndImplementation',
	config: function(){
		configCallOrder.push('decoration');
	}
})
export class ModuleWithConfigDecorationAndImplementation {
	
	onConfig() {
		configCallOrder.push('implementation');
	}
	
}

// --

@Module({
	run: function(){}
})
export class ModuleWithRunDecoration{}

// --

@Module()
export class ModuleWithRunImplementation {
	
	onRun() {
	}
	
}

// --

var runCallOrder: string[] = [];
export {runCallOrder};

@Module({
	name: 'ModuleWithRunDecorationAndImplementation',
	run: function(){
		runCallOrder.push('decoration');
	}
})
export class ModuleWithRunDecorationAndImplementation {
	
	onRun() {
		runCallOrder.push('implementation');
	}
	
}