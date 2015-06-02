/// <reference path="./_references" />

import {publishService} from 'tng/service';
import {ModuleSpy} from './utils';

// assets
import * as assets from './assets/test-service';

describe('@Service > publishService >',function() {
	
	var moduleSpy: ModuleSpy;
		
	beforeEach(function() {
		moduleSpy = new ModuleSpy();
	});
	
	it('should only accept classes decorated through @Service', function() {
		function service() {
			publishService(assets.TestService, <any>moduleSpy);
		}
		expect(service).not.toThrow();

		function notService() {
			publishService(function() { }, <any>moduleSpy);
		}
		expect(notService).toThrow();
	});
	
	it('should publish the service through angular.Module.service when the service is neither annotated with a provider nor a factory', function() {
		publishService(assets.TestService, <any>moduleSpy);
		expect(moduleSpy.service).toHaveBeenCalled();
		
		var args = moduleSpy.service.calls.mostRecent().args;
		expect(args[1]).toBe(assets.TestService);
	});
	
	it('should publish the service through angular.Module.provider when the service is annotated with a provider', function() {
		publishService(assets.TestServiceWithProvider, <any>moduleSpy);
		expect(moduleSpy.provider).toHaveBeenCalled();
		
		var args = moduleSpy.provider.calls.mostRecent().args;
		expect(args[1]).toBe(assets.TestServiceWithProvider.provider);
	});
	
	it('should publish the service through angular.Module.factory when the service is annotated with a factory', function() {
		publishService(assets.TestServiceWithFactory, <any>moduleSpy);
		expect(moduleSpy.factory).toHaveBeenCalled();
		
		var args = moduleSpy.factory.calls.mostRecent().args;
		expect(args[1]).toBe(assets.TestServiceWithFactory.factory);
	});
	
	it('should use the annotated name for the service', function() {
		publishService(assets.TestService, <any>moduleSpy);
		var args = moduleSpy.service.calls.mostRecent().args;
		expect(args[0]).toBe('testService');
	});
	
	it('should use the name passed through parameter instead of the annotated one', function() {
		publishService(assets.TestService, <any>moduleSpy, 'newName');
		var args = moduleSpy.service.calls.mostRecent().args;
		expect(args[0]).toBe('newName');
	});
	
});