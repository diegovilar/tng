/// <reference path="./_references" />

import {publishDirective} from 'tng/directive';
import {ModuleSpy} from './utils';

// assets
import * as assets from './assets/test-directive';

describe('@Directive > publishDirective >',function() {
	
	var moduleSpy: ModuleSpy;
	// var realModule = angular.module('test', []); 
		
	beforeEach(function() {
		moduleSpy = new ModuleSpy();
		// angular.mock.module('test');
	});
	
	it('should only accept classes decorated through @Directive', function() {
		function directive() {
			publishDirective(assets.TestDirective, <any>moduleSpy);
		}
		expect(directive).not.toThrow();

		function notDirective() {
			publishDirective(function() { }, <any>moduleSpy);
		}
		expect(notDirective).toThrow();
	});
	
	it('should publish the directive through angular.Module.directive', function() {
		publishDirective(assets.TestDirective, <any>moduleSpy);
		expect(moduleSpy.directive).toHaveBeenCalled();
	});
	
	it('should use the annotated selector for the directive', function() {
		publishDirective(assets.TestDirective, <any>moduleSpy);
		var args = moduleSpy.directive.calls.mostRecent().args;
		expect(args[0]).toBe('testDirective');
	});
	
	// TODO
	// it('should use the selector passed through parameter instead of the annotated one', function() {
	// 	publishDirective(assets.TestDirective, <any>moduleSpy, 'new-selector');
	// 	var args = moduleSpy.directive.calls.mostRecent().args;
	// 	expect(args[0]).toBe('newSelector');
	// });
	
	it('should produce a factory that returns an adequate DDO', function() {
		// for this test, we'll be needing the injector, so we need a real module
		var realModule = angular.module('test', []);
		var spy = new ModuleSpy(realModule);
		
		// get the produced factory
		publishDirective(assets.TestDirective, realModule);
		var factory = spy.directive.calls.mostRecent().args[1];
		
		// get the injector
		angular.mock.module('test');
		var $injector: ng.auto.IInjectorService;
		inject(function(_$injector_: any) {
			$injector = _$injector_
		});
		
		// get the produced DDO
		var DDO = $injector.invoke(factory);
				
		expect(DDO).toEqual(assets.expectedDDO);
		
		// TODO we need more tests to verify diferente configurations for the DDO
	});
	
});