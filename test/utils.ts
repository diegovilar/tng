/// <reference path="./_references" />


export class ModuleSpy {
	
	constructor(ngModule?: ng.IModule) {
		
		var members = [
			'value',
			'constant',
			'service',
			'factory',
			'provider',
			'directive',
			'config',
			'run'
		];
		
		members.forEach((member) => {
			(<any>this)[member] = ngModule ?
				spyOn(ngModule, member).and.callThrough() :
					jasmine.createSpy(member)
		});
		
	}
	
	value: jasmine.Spy;
	constant: jasmine.Spy;
	service: jasmine.Spy;
	factory: jasmine.Spy;
	provider: jasmine.Spy;
	directive: jasmine.Spy;
	config: jasmine.Spy;
	run: jasmine.Spy;
	
}

function noop(){}

// export interface AngularSpy {
	// module: jasmine.Spy;
// }
export var angularSpy = {
	
	module: <jasmine.Spy> null,
	
	spy: function(callThrough=false) {
		
		var orignal = angular.module;
		var spy = spyOn(angular, 'module');
		
		if (callThrough) spy.and.callFake(function() {			
			return new ModuleSpy(orignal.apply(null, arguments));
		});
		// if (callThrough) spy.and.callThrough();
		
		(<any> angularSpy).module = spy;
				
	},
	
	spyAndCallThrough: function() {
		angularSpy.spy(true);
	}
	
};
// export var angularSpy = {
	
// 	module: <jasmine.Spy> null,
	
// 	spy: function(callThrough=false) {
		
// 		var names = [
// 			'module'
// 		];
		
// 		names.forEach((name) => {
// 			let spy = spyOn(angular, name);
			
// 			if (callThrough) spy.and.callThrough();
// 			// else spy.and.callFake(noop);
			
// 			// (<any> angularSpy)[name] = (<any> angular)[name];
// 			(<any> angularSpy)[name] = spy;
// 		})
				
// 	},
	
// 	spyAndCallThrough: function() {
// 		angularSpy.spy(true);
// 	}
	
// };