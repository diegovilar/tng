/// <reference path="../_references" />

import {Module} from 'tng/module';

// --

@Module({
	name: 'NamedModule'
})	
export class NamedModule {
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

@Module({
	name: 'ModuleWithConfigDecorationAndImplementation',
	config: function(){
		ModuleWithConfigDecorationAndImplementation.configCallOrder.push('decoration');
	}
})
export class ModuleWithConfigDecorationAndImplementation {
	
	static configCallOrder: string[] = [];
	
	onConfig() {
		ModuleWithConfigDecorationAndImplementation.configCallOrder.push('implementation');
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


@Module({
	name: 'ModuleWithRunDecorationAndImplementation',
	run: function(){
		ModuleWithRunDecorationAndImplementation.runCallOrder.push('decoration');
	}
})
export class ModuleWithRunDecorationAndImplementation {
	
	static runCallOrder: string[] = [];
	
	onRun() {
		ModuleWithRunDecorationAndImplementation.runCallOrder.push('implementation');
	}
	
}

// --

@Module()
export class ModuleToTestIfConstructorGetsCalledWithNgModule {
	
	static injectedModule: any = null;
	
	constructor(ngModule: any) {
		ModuleToTestIfConstructorGetsCalledWithNgModule.injectedModule = ngModule;
	}
}