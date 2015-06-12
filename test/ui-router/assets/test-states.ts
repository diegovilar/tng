/// <reference path="../../_references" />

import {Module} from 'tng/module';
import {View} from 'tng/view';
import {States} from 'tng/ui-router/states';


// Common assets

@View({
	controllerAs: 'home',
    template: '<div ui-view="side"></div> <div ui-view></div>'
})
export class Home {	
}

@View({
	controllerAs: 'about',
    templateUrl: 'about.html',
    template: 'redudant, just for testing'
})
export class About {	
}

@View({
	controllerAs: 'menu',
    templateUrl: 'menu.html'
})
export class Menu {	
}



// Test 1

@Module()
@States({
    'home': { url: '/', abstract: true, view: Home },
    'about': { url: '/about', parent: 'home', view: About }
})
export class TestModule1 {
}
    
    

// Test 2

@Module()
@States({
	'about': { url: '/about', abstract: false, parent: 'home', view: About }
})
export class TestModule2 {
    
    static expectedConfig = {
    	name: 'about',
    	url: '/about',
    	abstract: false,
    	parent: 'home'
    };
    
}



// Test 3

@Module()
@States({
	'about': { url: '/about', parent: 'home', view: About }
})
export class TestModule3 {
    
    static expectedAboutConfig = {
    	views: {
    		'' : {
    			controller: About,
    			controllerAs: 'about',
                templateUrl: 'about.html',
                template: 'redudant, just for testing'
    		}
    	}	
    };
    
}



// Test 4

@Module()
@States({
    'home': { url: '/', views: {
        '': Home,
        'side@home': Menu,
        '@home': About
    }}
})    
export class Test4 {
}



// test 5

@Module()
@States.on('$viewContentLoading', test5eventHandler)
export class Test5 {
}

export function test5eventHandler(event: ng.IAngularEvent) {
}