/// <reference path="../../_references" />

import {Module} from 'tng/module';
import {View} from 'tng/view';
import {Routes} from 'tng/ui-router/routes';



// Test 1

@Module()
@Routes({
    '?' : '/not-found'
})    
export class Test1 {
}



// Test 2

@Module()
@Routes({
    '': '/home',
    '/index': '/home'
})    
export class Test2 {
}