import * as assert from 'assert';
import {Inject} from './inject';

// Testing using Inject in constructor and method parameters
class Test {	
	constructor(@Inject('a') private a:any) {		
	}
	
	method(@Inject('a') a:any) {
	}	
}
assert((<any>Test).$inject[0] === 'a');
assert((<any>Test).prototype.method.$inject[0] === 'a');

// Testing using Inject in a function
Inject(['a'], func);
function func(a:any) {	
}

assert((<any>func).$inject[0] === 'a');
