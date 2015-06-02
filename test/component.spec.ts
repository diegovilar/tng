/// <reference path="./_references" />

import {publishComponent} from 'tng/component';
import {ModuleSpy} from './utils';

// assets
import * as assets from './assets/test-component';

describe('@Component >',function() {
	
	describe('publishComponent >', function() {
		
		var moduleSpy: ModuleSpy;
		
		beforeEach(function() {
			moduleSpy = new ModuleSpy();
		});
		
		it('should only accept classes decorated through both @Component and @View', function() {
			function component() {
				publishComponent(assets.TestComponent, <any>moduleSpy);
			}
			expect(component).not.toThrow();
	
			function notComponent() {
				publishComponent(function() { }, <any>moduleSpy);
			}
			expect(notComponent).toThrow();
		});
		
		it('should publish the component through angular.Module.directive', function() {
			publishComponent(assets.TestComponent, <any>moduleSpy);
			expect(moduleSpy.directive).toHaveBeenCalled();
		});
		
		it('should require at least one template to be defined', function() {
			function noTemplate() {
				publishComponent(assets.TestComponentWithNoTemplate, <any>moduleSpy);
			}
			expect(noTemplate).toThrowError();
		});
		
		it('should use the annotated selector for the component', function() {
			publishComponent(assets.TestComponent, <any>moduleSpy);
			var name = moduleSpy.directive.calls.mostRecent().args[0];
			expect(name).toBe(assets.expectedDDO.imperativeName);
		});
		
		// TODO
		// it('should use the selector passed through parameter instead of the annotated one', function() {
		// 	publishComponent(assets.TestDirective, <any>moduleSpy, 'new-selector');
		// 	var args = moduleSpy.directive.calls.mostRecent().args;
		// 	expect(args[0]).toBe('newSelector');
		// });
		
		it('should produce a factory that returns an adequate DDO', function() {
			// for this test, we'll be needing the injector, so we need a real module
			var realModule = angular.module('test', []);
			var spy = new ModuleSpy(realModule);
			
			// get the produced factory
			publishComponent(assets.TestComponent, realModule);
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
	
});