/// <reference path="./_references" />


export class ModuleSpy {
	value = jasmine.createSpy('value');
	constant = jasmine.createSpy('constant');
	service = jasmine.createSpy('service');
	factory = jasmine.createSpy('factory');
	provider = jasmine.createSpy('provider');
	directive = jasmine.createSpy('directive');
}

function noop(){}

// export interface AngularSpy {
	// module: jasmine.Spy;
// }
export var angularSpy = {
	
	module: <jasmine.Spy> null,
	
	spy: function(callThrough=false) {
		
		var names = [
			'module'
		];
		
		names.forEach((name) => {
			let spy = spyOn(angular, name);
			
			if (callThrough) spy.and.callThrough();
			// else spy.and.callFake(noop);
			
			// (<any> angularSpy)[name] = (<any> angular)[name];
			(<any> angularSpy)[name] = spy;
		})
				
	},
	
	spyAndCallThrough: function() {
		angularSpy.spy(true);
	}
	
};