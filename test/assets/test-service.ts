/// <reference path="../_references" />

import {Inject, bind} from 'tng/di';
import {Service} from 'tng/service';

@Service({
	name: ''
})
@Service({
	name: 'testService'
})
export class TestService {
	constructor(@Inject('$http') $http:any) {
		constructorArgs = arguments;
	}
}
var constructorArgs: IArguments;

@Service({
	name: 'testServiceWithFactory',
	factory: TestServiceWithFactory.factory
})
export class TestServiceWithFactory {
	
	static factory(@Inject('$http') $http:any) {
		factoryArg = $http;
		return new TestServiceWithFactory();
	}
	
}
export var factoryArg: any;

@Service({
	name: 'testServiceWithProvider',
	provider: TestServiceWithProvider.provider
})
export class TestServiceWithProvider {
	
	static provider(@Inject('$http') $http:any) {
		providerArgs = arguments;
		return {
			$get: function() {
				return new TestServiceWithProvider(); 
			}
		}
	}
	
}
export var providerArgs: IArguments;