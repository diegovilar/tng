/// <reference path="./_references" />

import {bootstrap} from 'tng/bootstrap';
import {angularSpy, ModuleSpy, newElement} from './utils';

// assets
import * as assets from './assets/test-bootstrap';

describe('bootstrap >', function() {
	
	// Test 1
	it('should only accept modules', function() {
		function bootstrapApp() {
			bootstrap(assets.TestApp1);
		}
		expect(bootstrapApp).not.toThrow();
		
		function bootstrapModule() {
			bootstrap(assets.TestModule1, newElement());
		}
		expect(bootstrapModule).not.toThrow();
		
		function bootstrapFunction() {
			bootstrap(function(){});
		}
		expect(bootstrapFunction).toThrow();
	});
	
	// Test 2
	it('should throw an error if a module is passed and no element is provided', function() {
		function bootstrapModule() {
			bootstrap(assets.TestModule2);
		}
		expect(bootstrapModule).toThrow();
	});
	
	// Test 3
	it('should use the element provided through decoration', function() {
		var spy = spyOn(angular, 'bootstrap');
		bootstrap(assets.TestApp3);
		expect(spy.calls.mostRecent().args[0]).toBe(assets.test3element);
	});
	
	// Test 4
	it('should use the element provided through parameter, if any', function() {
		var spy = spyOn(angular, 'bootstrap');
		var element = newElement();
		bootstrap(assets.TestApp4, element);
		expect(spy.calls.mostRecent().args[0]).toBe(element);
	});
	
});