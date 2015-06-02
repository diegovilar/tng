/// <reference path="../_references" />

import {Directive} from 'tng/directive';

@Directive({
	selector: 'test-directive'
})
export class TestDirective {	
}

export var expectedDDO = {
	semanticName: 'test-directive',
	imperativeName: 'testDirective',
	restrict: 'E',
	controller: TestDirective
};