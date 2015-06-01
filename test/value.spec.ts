/// <reference path="./_references" />

import {ValueWrapper, publishValue} from 'tng/value';
import {angularSpy, ModuleSpy} from './utils';

// assets
import * as assets from './assets/test-value';

describe('Value',function() {
	
	it('should wrap a value properly',function() {
		expect(assets.wrappedValue instanceof ValueWrapper).toBe(true);		
	});
	
	describe('publishValue', function() {
		
		var fakeModule = new ModuleSpy();
		
		it('should publish the value to the target module with the provided', function() {
			publishValue(assets.wrappedValue, <any>fakeModule);
			
			expect(fakeModule.value).toHaveBeenCalled();
			
			var args = fakeModule.value.calls.mostRecent().args;
			expect(args[0]).toBe(assets.valueName);
			expect(args[1]).toBe(assets.value);
		});
		
		it('should publish the value with the provided name instead of the annotated one', function() {
			var newName = 'newValueName';
			
			publishValue(assets.wrappedValue, <any>fakeModule, newName);			
			var args = fakeModule.value.calls.mostRecent().args;
			expect(args[0]).toBe(newName);
		});		
		
	});
	
});