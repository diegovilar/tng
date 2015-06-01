/// <reference path="./_references" />

import {ConstantWrapper, publishConstant} from 'tng/constant';
import {angularSpy, ModuleSpy} from './utils';

// assets
import * as assets from './assets/test-constant';

describe('Constant',function() {
	
	it('should wrap a constant properly',function() {
		expect(assets.wrappedConstant instanceof ConstantWrapper).toBe(true);		
	});
	
	describe('publishValue', function() {
		
		var fakeModule = new ModuleSpy();
		
		it('should publish the constant to the target module with the annotated name', function() {
			publishConstant(assets.wrappedConstant, <any>fakeModule);
			
			expect(fakeModule.constant).toHaveBeenCalled();
			
			var args = fakeModule.constant.calls.mostRecent().args;
			expect(args[0]).toBe(assets.constantName);
			expect(args[1]).toBe(assets.constant);
		});
		
		it('should publish the constant with the provided name instead of the annotated one', function() {
			var newName = 'newConstantName';
			
			publishConstant(assets.wrappedConstant, <any>fakeModule, newName);			
			var args = fakeModule.constant.calls.mostRecent().args;
			expect(args[0]).toBe(newName);
		});		
		
	});
	
});