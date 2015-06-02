/// <reference path="./_references" />

import {publishDirective} from 'tng/directive';
import {ModuleSpy} from './utils';

// assets
import * as assets from './assets/test-directive';

describe('@Directive > publishDirective >',function() {
	
	var moduleSpy: ModuleSpy;
		
	beforeEach(function() {
		moduleSpy = new ModuleSpy();
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
	
	// it('should use the name passed through parameter instead of the annotated one', function() {
	// 	publishService(assets.TestService, <any>moduleSpy, 'newName');
	// 	var args = moduleSpy.service.calls.mostRecent().args;
	// 	expect(args[0]).toBe('newName');
	// });
	
});