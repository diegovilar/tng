/// <reference path="./_references" />

import {publishModule} from 'tng/module';
import {angularSpy, ModuleSpy} from './utils';

// assets
import * as assets from './assets/test-module';

describe('@Module >', function() {
	
	describe('publishModule >', function() {
		
		// Test #1
		it('should only accept classes decorated through @Module', function() {
			function aModule() {
				publishModule(assets.TestModule1);
			}
			expect(aModule).not.toThrow();
			
			function notModule() {
				publishModule(function(){});
			}
			expect(notModule).toThrow();
		});
		
		// Test #2
		it('should publish the module through angular.module', function() {
			angularSpy.spy();
			publishModule(assets.TestModule2);
			expect(angularSpy.module).toHaveBeenCalled();
		});
		
		// Test #3
		it('should use the annotated name for the module', function() {
			var ngModule = publishModule(assets.TestModule3);
			expect(ngModule.name).toBe('TestModule3');
		});
		
		// Test #4
		it('should use the name passed through parameter instead of the annotated one', function() {
			var ngModule = publishModule(assets.TestModule4, 'newName');
			expect(ngModule.name).toBe('newName');
		});
		
		// Test #5
		it('should use an auto-generated name otherwise', function() {
			var ngModule = publishModule(assets.TestModule5);
			expect(ngModule.name).toMatch(/tng_generated_module#\d+/);
		});
		
		// Test #6
		it('should publish values, constants, services, directives, components and other modules', function() {
			angularSpy.spyAndCallThrough(true);
			var moduleSpy = <ModuleSpy><any> publishModule(assets.TestModule6);
			expect(moduleSpy.constant).toHaveBeenCalled();
			expect(moduleSpy.value).toHaveBeenCalled();
			expect(moduleSpy.service).toHaveBeenCalled();
			expect(moduleSpy.directive.calls.count()).toBe(2); // 1 directive, 1 component
			expect(angularSpy.module.calls.count()).toBe(2); // 1 for itself, 1 for the module it depends on
		});
		
		// Test #7
		it('should not publish the same module twice to angular', function() {
			angularSpy.spyAndCallThrough();
			publishModule(assets.TestModule7);
			publishModule(assets.TestModule7);
			
			// Second call to angular.module uses the get module signature (angular.module(name)),
			// taking just 1 parameter, to retrieve the already published module TestModule7
			expect(angularSpy.module.calls.mostRecent().args.length).toBe(1);
		});
		
		// Test #8
		it('even as a dependency', function() {
			angularSpy.spyAndCallThrough();
			publishModule(assets.TestModule8b);
			publishModule(assets.TestModule8); // depends on TestModule8b
			
			// Second call to angular.module uses the get module signature (angular.module(name)),
			// taking just 1 parameter, to retrieve the already published module TestModule8b
			expect(angularSpy.module.calls.argsFor(1).length).toBe(1);
		});
		
		// Test #9
		it('should not allow unknown dependencies', function() {
			function invalidDependency() {
				publishModule(assets.TestModule9);
			} 
			expect(invalidDependency).toThrow();
		});
		
	});
	
	describe('config >', function() {
		
		// Test #10
		it('if configuration functions are provided through decoration, register them', function() {
			angularSpy.spyAndCallThrough(true);
			var ngModule = publishModule(assets.TestModule10);
			expect(ngModule.config).toHaveBeenCalled();
		});
		
		// Test #11
		it('if configuration functions are provided through implementation, register them', function() {
			angularSpy.spyAndCallThrough(true);
			var ngModule = publishModule(assets.TestModule11);
			expect(ngModule.config).toHaveBeenCalled();
		});
		
		// Test #12
		it('implementation config functions get executed BEFORE decoration config functions', function() {
			angularSpy.spyAndCallThrough(true);
			publishModule(assets.TestModule12);
			
			// load the module
			angular.mock.module('TestModule12');
			angular.mock.inject();
			
			expect(assets.TestModule12.callOrder).toEqual(['implementation', 'decoration']);
		});
		
	});
	
	describe('run >', function() {
		
		// Test #13
		it('if initialization functions are provided through decoration, register them', function() {
			angularSpy.spyAndCallThrough(true);
			var ngModule = publishModule(assets.TestModule13);
			expect(ngModule.run).toHaveBeenCalled();
		});
		
		// Test #14
		it('if initialization functions are provided through implementation, register them', function() {
			angularSpy.spyAndCallThrough(true);
			var ngModule = publishModule(assets.TestModule14);
			expect(ngModule.run).toHaveBeenCalled();
		});
		
		// Test #15
		it('implementation initialization functions get executed BEFORE decoration initialization functions', function() {
			angularSpy.spyAndCallThrough(true);
			publishModule(assets.TestModule15);
			
			// load the module
			angular.mock.module('TestModule15');
			angular.mock.inject();
			
			expect(assets.TestModule15.runCallOrder).toEqual(['implementation', 'decoration']);
		});
		
	});
	
	// Test #16
	it('module constructors should receive a reference to their respective angular module when instantiating', function() {
		var ngModule = publishModule(assets.TestModule16);
		expect(ngModule).toBe(assets.TestModule16.injectedModule);
	})
	
});