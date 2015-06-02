/// <reference path="./_references" />

import {ConstantWrapper, publishConstant} from 'tng/constant';
import {angularSpy, ModuleSpy} from './utils';

// assets
import * as assets from './assets/test-constant';

describe('Constant >',function() {
	
	it('should wrap the given value in a ConstantWrapper',function() {
		expect(assets.wrappedConstant instanceof ConstantWrapper).toBe(true);		
	});
	
	describe('publishConstant >', function() {
		
		var moduleSpy: ModuleSpy;
		
		beforeEach(function() {
			moduleSpy = new ModuleSpy();
		});
		
		it('should only accept instances of ConstantWrapper', function() {
			function constant() {
				publishConstant(assets.wrappedConstant, <any>moduleSpy);
			}
			expect(constant).not.toThrow();
			
			function notConstant() {
				publishConstant(<any>null, <any>moduleSpy);
			}
			expect(notConstant).toThrow();
		});
		
		it('should publish the constant through angular.Module.constant', function() {
			publishConstant(assets.wrappedConstant, <any>moduleSpy);			
			expect(moduleSpy.constant).toHaveBeenCalled();
			
			var args = moduleSpy.constant.calls.mostRecent().args;
			expect(args[1]).toBe(assets.constantValue);
		});	

		it('should use the annotated name for the constant', function() {
			publishConstant(assets.wrappedConstant, <any>moduleSpy);			
			var args = moduleSpy.constant.calls.mostRecent().args;
			expect(args[0]).toBe(assets.constantName);
		});	
		
		it('should use the provided name, if any, instead of the annotated one', function() {
			publishConstant(assets.wrappedConstant, <any>moduleSpy, 'newName');			
			var args = moduleSpy.constant.calls.mostRecent().args;
			expect(args[0]).toBe('newName');
		});	
		
	});
	
});