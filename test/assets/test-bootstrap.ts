/// <reference path="../_references" />

import {Application} from 'tng/application';
import {Module} from 'tng/module';
import {newElement} from '../utils';

// Test 1
@Application(newElement())
export class TestApp1 {
}

@Module()
export class TestModule1 {
}



// Test 2
@Module()
export class TestModule2 {
}



// Test 3
export var test3element = newElement();
@Application(test3element)
export class TestApp3 {
}



// Test 4
export var test4element = newElement();
@Application(test4element)
export class TestApp4 {
}