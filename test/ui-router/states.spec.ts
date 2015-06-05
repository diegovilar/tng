/// <reference path="../_references" />

import {bind} from 'tng/di';
import {publishModule} from 'tng/module';
import {angularSpy, ModuleSpy} from '../utils';

// assets
import * as assets from './assets/test-states';

fdescribe('UI Router > @States', function() {
	
	// Setup a spy on $stateProvider.state on each test
	var stateSpy: jasmine.Spy;
	angular.module('spy-states', ['ui.router'], function($stateProvider: any) {
		stateSpy = spyOn($stateProvider, 'state');
	});		
	beforeEach(angular.mock.module('spy-states'));
	
	// Test 1
	it('name, url, abstract and parent should me translated correctly ' +
	   'to config object passed to $stateProvider for each stated', function() {
		
		var ngModule = publishModule(assets.TestModule1);
		
		angular.mock.module(ngModule.name);
		angular.mock.inject();
		
		expect(stateSpy.calls.argsFor(0)[0]).toEqual(assets.teste1expectedConfigForHome);
		expect(stateSpy.calls.argsFor(1)[0]).toEqual(assets.teste1expectedConfigForAbout);
			   
	});
	
});