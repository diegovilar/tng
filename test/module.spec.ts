/// <reference path="./_references" />

import {publishModule} from 'tng/module';
import {angularSpy, ModuleSpy} from './utils';

// assets
import * as assets from './assets/test-module';

describe('@Module >', function() {
	
	describe('publishModule >', function() {
		
		beforeEach(angularSpy.spyAndCallThrough);
		
		it('should only accept classes decorated through @Module', function() {
			function aModule() {
				publishModule(assets.NamedModule);
			}
			expect(aModule).not.toThrow();
			
			function notModule() {
				publishModule(function(){});
			}
			expect(notModule).toThrow();
		});
		
		it('should publish the module through angular.module', function() {
			publishModule(assets.NamedModule);
			expect(angularSpy.module).toHaveBeenCalled();
		});
		
		it('should use the annotated name for the module', function() {
			publishModule(assets.NamedModule);
			var name = angularSpy.module.calls.mostRecent().args[0];
			expect(name).toBe('NamedModule');
		});
		
		it('should use the name passed through parameter instead of the annotated one', function() {
			publishModule(assets.NamedModule, 'newName');
			var name = angularSpy.module.calls.mostRecent().args[0];
			expect(name).toBe('newName');
		});
		
		it('should use the name passed through parameter instead of the annotated one', function() {
			publishModule(assets.AnnonymousModule);
			var name = angularSpy.module.calls.mostRecent().args[0];
			expect(name).toBe('tng_generated_module#1');
		});
		
		it('should publish values, constants, services, directives, components and other modules', function() {
			var moduleSpy = <ModuleSpy><any> publishModule(assets.ModuleWithDependencies);
			expect(moduleSpy.constant).toHaveBeenCalled();
			expect(moduleSpy.value).toHaveBeenCalled();
			expect(moduleSpy.service).toHaveBeenCalled();
			expect(moduleSpy.directive.calls.count()).toBe(2); // 1 directive, 1 component
			expect(angularSpy.module.calls.count()).toBe(2); // 1 for itself, 1 for the module it depends on
		});
		
		it('should not publish the same dependent module twice', function() {
			publishModule(assets.InnerModule);
			publishModule(assets.OutterModule);
			expect(angularSpy.module.calls.count()).toBe(2); // Innere does not get republished by Outter
		});
		
		it('should not allow unknown dependencies', function() {
			function invalidDependency() {
				publishModule(assets.ModuleWithInvalidDependencies);
			} 
			expect(invalidDependency).toThrow();
		});
		
	});
	
	describe('config >', function() {
		
		beforeEach(angularSpy.spyAndCallThrough);
		
		it('if configuration functions are provided through decoration, register them', function() {
			var moduleSpy = <ModuleSpy><any> publishModule(assets.ModuleWithConfigDecoration);
			expect(moduleSpy.config).toHaveBeenCalled();
		});
		
		it('if configuration functions are provided through implementation, register them', function() {
			var moduleSpy = <ModuleSpy><any> publishModule(assets.ModuleWithConfigImplementation);
			expect(moduleSpy.config).toHaveBeenCalled();
		});
		
		it('implementation config functions get registered BEFORE decoration config functions', function() {
			var moduleSpy = <ModuleSpy><any> publishModule(assets.ModuleWithConfigDecorationAndImplementation);
			
			// load the module
			angular.mock.module('ModuleWithConfigDecorationAndImplementation');
			angular.mock.inject();
			
			expect(assets.ModuleWithConfigDecorationAndImplementation.configCallOrder).toEqual(['implementation', 'decoration']);
		});
		
	});
	
	describe('run >', function() {
		
		beforeEach(angularSpy.spyAndCallThrough);
		
		it('if initialization functions are provided through decoration, register them', function() {
			var ngModule = publishModule(assets.ModuleWithRunDecoration);
			expect(ngModule.run).toHaveBeenCalled();
		});
		
		it('if initialization functions are provided through implementation, register them', function() {
			var ngModule =publishModule(assets.ModuleWithRunImplementation);
			expect(ngModule.run).toHaveBeenCalled();
		});
		
		it('implementation initialization functions get registered BEFORE decoration initialization functions', function() {
			publishModule(assets.ModuleWithRunDecorationAndImplementation);
			
			// load the module
			angular.mock.module('ModuleWithRunDecorationAndImplementation');
			angular.mock.inject();
			
			expect(assets.ModuleWithRunDecorationAndImplementation.runCallOrder).toEqual(['implementation', 'decoration']);
		});
		
	});
	
	it('module constructors should receive a reference to their respective angular module when instantiating', function() {
		var ngModule = publishModule(assets.ModuleToTestIfConstructorGetsCalledWithNgModule);
		expect(ngModule).toBe(assets.ModuleToTestIfConstructorGetsCalledWithNgModule.injectedModule);
	})
	
});