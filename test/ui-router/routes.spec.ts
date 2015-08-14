/// <reference path="../_references.ts" />

import {injectable} from 'tng/di'
import {publishModule} from 'tng/module'
import {angularSpy, ModuleSpy} from '../utils'
import * as assets from './assets/test-routes';



describe('UI Router > @States', function() {
	
    // Setup spies for $urlRouterProvider methods
    var whenSpy: jasmine.Spy;
    var otherwiseSpy: jasmine.Spy;
    angular.module('spy-routes', ['ui.router'], function($urlRouterProvider: any) {
        whenSpy = spyOn($urlRouterProvider, 'when').and.callThrough();
        otherwiseSpy = spyOn($urlRouterProvider, 'otherwise').and.callThrough();
    });
    beforeEach(angular.mock.module('spy-routes'));
    
    // Test 1
    it('should call $urlRouterProvider.otherwise for the "?" route', function() {

        var ngModule = publishModule(assets.Test1);
		
        // Load the module
        angular.mock.module(ngModule.name);
        angular.mock.inject();

        expect(otherwiseSpy.calls.count()).toBe(1);

    });
    
    // Test 2
    it('should call $urlRouterProvider.when for every other route', function() {

        var ngModule = publishModule(assets.Test2);
		
        // Load the module
        angular.mock.module(ngModule.name);
        angular.mock.inject();

        expect(whenSpy.calls.count()).toBe(2);

    });

});