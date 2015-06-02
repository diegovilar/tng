/// <reference path="../_references" />

import {Component, ComponentView} from 'tng';

@Component({
	selector: 'test-component'
})
@ComponentView({
	controllerAs: 'test',
	template: 'sup'
})
export class TestComponent {	
}

export var expectedDDO = {
	semanticName: 'test-component',
	imperativeName: 'testComponent',
	restrict: 'E',
	controller: TestComponent,
	controllerAs: 'test',
	template: 'sup'
};

// --

@Component({
	selector: 'test-component-with-no-template'
})
@ComponentView({
	controllerAs: 'test'
})
export class TestComponentWithNoTemplate {
	
}