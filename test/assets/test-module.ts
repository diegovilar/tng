/// <reference path="../_references" />

import {Module} from 'tng/module';

// Test #1

@Module()	
export class TestModule1 {
}



// Test #2

@Module()	
export class TestModule2 {
}



// Test #3

@Module({
	name: 'TestModule3'
})
export class TestModule3 {
}



// Test #4

@Module({
	name: 'TestModule4'
})
export class TestModule4 {
}



// Test #5

@Module()
export class TestModule5 {
}



// Test #6

import * as constants from './test-constant';
import * as values from './test-value';
import * as services from './test-service';
import * as components from './test-component';
import * as directives from './test-directive';

@Module()
class TestModule6b{}

@Module({
	dependencies: [
		constants.wrappedConstant,
		values.wrappedValue,
		services.TestService,
		directives.TestDirective,
		components.TestComponent,
		TestModule6b
	]
})
export class TestModule6 {
}



// Test #7

@Module()
export class TestModule7 {
}



// Test #8

@Module()
export class TestModule8b{}

@Module({
	dependencies: [
		TestModule8b
	]
})
export class TestModule8 {
}



// Test #9

@Module({
	dependencies: [
		function(){}
	]
})
export class TestModule9 {
}



// Test #10

@Module({
	config: function(){}
})
export class TestModule10{
}



// Test #11

@Module()
export class TestModule11 {
	
	onConfig() {
	}
	
}



// Test #12

@Module({
	name: 'TestModule12',
	config: function(){
		TestModule12.callOrder.push('decoration');
	}
})
export class TestModule12 {
	
	static callOrder: string[] = [];
	
	onConfig() {
		TestModule12.callOrder.push('implementation');
	}
	
}



// Test #13

@Module({
	run: function(){}
})
export class TestModule13 {
}



// Test #14

@Module()
export class TestModule14 {
	
	onRun() {
	}
	
}



// Test #15

@Module({
	name: 'TestModule15',
	run: function(){
		TestModule15.runCallOrder.push('decoration');
	}
})
export class TestModule15 {
	
	static runCallOrder: string[] = [];
	
	onRun() {
		TestModule15.runCallOrder.push('implementation');
	}
	
}



// Test #16

@Module()
export class TestModule16 {
	
	static injectedModule: any = null;
	
	constructor(ngModule: any) {
		TestModule16.injectedModule = ngModule;
	}
}