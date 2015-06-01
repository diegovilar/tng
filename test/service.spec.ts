/// <reference path="./_references" />

import {hasAnnotation, getAnnotations} from 'tng/reflection';
import {ServiceAnnotation, publishService} from 'tng/service';
import {angularSpy, ModuleSpy} from './utils';

// assets
import * as assets from './assets/test-service';

describe('Service',function() {
	
	it('should have a ServiceAnnotation', function() {
		var has = hasAnnotation(assets.TestService, ServiceAnnotation);
		expect(has).toBe(true);
	});
	
	it('should allow for multiple ServiceAnnotation instances', function() {
		var notes = getAnnotations(assets.TestService, ServiceAnnotation);
		expect(notes.length).toBe(2);
	});
	
	describe('publishService', function() {
		
		var fakeModule: ModuleSpy;
		
		beforeEach(function() {
			 fakeModule = new ModuleSpy();
		})		
		
		it('should publish the service onto the provided angular module', function() {
			publishService(assets.TestService, <any>fakeModule);
			expect(fakeModule.service).toHaveBeenCalled();
			
			var args = fakeModule.service.calls.mostRecent().args;
			expect(args[0]).toBe('testService'); 
			expect(args[1]).toBe(assets.TestService); 
		});
		
		it('should publishe the service with the provided name instead of the annotated one', function() {
			publishService(assets.TestService, <any>fakeModule, 'newServiceName');
			expect(fakeModule.service).toHaveBeenCalled();
			
			var args = fakeModule.service.calls.mostRecent().args;
			expect(args[0]).toBe('newServiceName');			
		});
		
	});
	
	describe('factory', function() {
		
		var ngModule: ng.IModule;
		var $injector: ng.auto.IInjectorService;
		var $http: ng.IHttpService;
		
		beforeEach(function() {
			angularSpy.spyAndCallThrough();
			
			ngModule = angular.module('test', []);
			publishService(assets.TestServiceWithFactory, ngModule);
			
			angular.mock.module('test');
		});
		
		beforeEach(inject(function(_$injector_: any, _$http_: any){
			$injector = _$injector_;
			$http = _$http_;
		}));
		
		it('should use the provided factory, if any, and invoke it with injections', function() {
			$injector.invoke(function(testServiceWithFactory: any) {});
			expect(assets.factoryArg).toBe($http);
		});
		
	});
	
});