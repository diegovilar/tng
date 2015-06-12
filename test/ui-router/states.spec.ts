/// <reference path="../_references" />

import {bind} from 'tng/di';
import {publishModule} from 'tng/module';
import {angularSpy, ModuleSpy} from '../utils';

// assets
import * as assets from './assets/test-states';

describe('UI Router > @States ', function() {
	
	// Setup a spy on $stateProvider.state for each test
	var stateSpy: jasmine.Spy;
	var $onSpy: jasmine.Spy;
	angular.module('spy-states', ['ui.router'], function($stateProvider: any, $provide: ng.auto.IProvideService) {
        stateSpy = spyOn($stateProvider, 'state').and.callThrough();
        $provide.decorator('$rootScope', function($delegate: ng.IRootScopeService) {
            $onSpy = spyOn($delegate, '$on').and.callThrough();
            return $delegate;
        });
	});		
    beforeEach(angular.mock.module('spy-states'));
    
    // Test 1
	it('should make $stateProvider.state be called once for each state', function() {
		
		var ngModule = publishModule(assets.TestModule1);
		
        // Load the module
        angular.mock.module(ngModule.name);
        angular.mock.inject();
        
        expect(stateSpy.calls.count()).toBe(2);
			   
    });
	
	// Test 2
	it('name, url, abstract and parent should be translated correctly ' +
	   'to config object passed to $stateProvider for each state', function() {
		
		var ngModule = publishModule(assets.TestModule2);
		
        // Load the module
        angular.mock.module(ngModule.name);
        angular.mock.inject();
           
        var config = stateSpy.calls.mostRecent().args[0];
        var expectedConfig = assets.TestModule2.expectedConfig;
           
        expect(config.name).toBe(expectedConfig.name);
        expect(config.url).toBe(expectedConfig.url);
        expect(config.abstract).toBe(expectedConfig.abstract);
        expect(config.parent).toBe(expectedConfig.parent);
			   
    });
    
    // Test 3
	it('view, when used, should translate to the default view and correctly ' +
	   'set controller, controllerAs, templateUrl and template', function() {
		
		var ngModule = publishModule(assets.TestModule3);
		
        // Load the module
        angular.mock.module(ngModule.name);
        angular.mock.inject();
           
        var aboutConfig = stateSpy.calls.mostRecent().args[0].views[''];
        var expectedAboutConfig = assets.TestModule3.expectedAboutConfig.views[''];
           
        expect(aboutConfig.controller).toBe(expectedAboutConfig.controller);
        expect(aboutConfig.controllerAs).toBe(expectedAboutConfig.controllerAs);
        expect(aboutConfig.templateUrl).toBe(expectedAboutConfig.templateUrl);
        expect(aboutConfig.template).toBe(expectedAboutConfig.template);
			   
        });
    
    // Test 4
    it('views, when used, should translate to the specified views and correctly ' +
        'set controller, controllerAs, templateUrl and template', function() {

        var ngModule = publishModule(assets.Test4);
		
        // Load the module
        angular.mock.module(ngModule.name);
        angular.mock.inject();
            
        var views = stateSpy.calls.argsFor(0)[0].views;
            
        expect(views['']).toBeDefined();
        expect(views[''].controller).toBe(assets.Home);
        expect(views[''].controllerAs).toBe('home');
        expect(views[''].template).toBe('<div ui-view="side"></div> <div ui-view></div>');
          
        expect(views['side@home']).toBeDefined();
        expect(views['side@home'].controller).toBe(assets.Menu);
        expect(views['side@home'].controllerAs).toBe('menu');
        expect(views['side@home'].templateUrl).toBe('menu.html');
        
        expect(views['@home']).toBeDefined();
        expect(views['@home'].controller).toBe(assets.About);
        expect(views['@home'].controllerAs).toBe('about');
        expect(views['@home'].templateUrl).toBe('about.html');
            
        });
    
    describe('.on > ', function() {
        
        it('should subscribe to events on $rootScope', function() {

            var ngModule = publishModule(assets.Test5);
		
            // Load the module
            angular.mock.module(ngModule.name);
            angular.mock.inject();
            
            expect($onSpy).toHaveBeenCalledWith('$viewContentLoading', assets.test5eventHandler);
            
        });
        
    });
	
});