/// <reference path="./_references" />

import {ValueWrapper, publishValue} from 'tng/value';
import {ModuleSpy} from './utils';

// assets
import * as assets from './assets/test-value';

describe('Value >',function() {
	
	it('should wrap the given value in a ValueWrapper',function() {
		expect(assets.wrappedValue instanceof ValueWrapper).toBe(true);		
	});
	
	describe('publishValue >', function() {
		
		var moduleSpy: ModuleSpy;

		beforeEach(function() {
			moduleSpy = new ModuleSpy();
		});
		
		it('should only accept instances of ValueWrapper', function() {
			function value() {
				publishValue(assets.wrappedValue, <any>moduleSpy);
			}
			expect(value).not.toThrow();
			
			function notValue() {
				publishValue(<any>null, <any>moduleSpy);
			}
			expect(notValue).toThrow();
		});
		
		it('should publish the value through angular.Module.value', function() {
			publishValue(assets.wrappedValue, <any>moduleSpy);			
			expect(moduleSpy.value).toHaveBeenCalled();
			
			var args = moduleSpy.value.calls.mostRecent().args;
			expect(args[1]).toBe(assets.value);
		});	

		it('should use the annotated name for the value', function() {
			publishValue(assets.wrappedValue, <any>moduleSpy);			
			var args = moduleSpy.value.calls.mostRecent().args;
			expect(args[0]).toBe(assets.valueName);
		});	
		
		it('should use the provided name, if any, instead of the annotated one', function() {
			publishValue(assets.wrappedValue, <any>moduleSpy, 'newName');			
			var args = moduleSpy.value.calls.mostRecent().args;
			expect(args[0]).toBe('newName');
		});	
		
	});
	
});