/// <reference path="../_references" />

import {Inject, injectable} from 'tng/di'
import {Service} from 'tng/service'



@Service({
	name: 'willBeOverriden'
})
@Service({
	name: 'testService'	// this should override the previous name
})
export class TestService {
}

@Service({
	name: 'testServiceWithFactory',
	factory: TestServiceWithFactory.factory
})
export class TestServiceWithFactory {
	
	static factory(@Inject('$http') $http:any) {
		return new TestServiceWithFactory();
	}
	
}

@Service({
	name: 'testServiceWithProvider',
	provider: TestServiceWithProvider.provider
})
export class TestServiceWithProvider {
	
	static provider(@Inject('$http') $http:any) {
		return {
			$get: function() {
				return new TestServiceWithProvider(); 
			}
		}
	}
	
}