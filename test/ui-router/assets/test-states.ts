/// <reference path="../../_references" />

import {Module} from 'tng/module';
import {View} from 'tng/view';
import {States} from 'tng/ui-router/states';
import {newElement} from '../../utils';

// Test 1
@View({
	controllerAs: 'home',
	template: '<div>home</div>'
})
export class Home {	
}

@View({
	controllerAs: 'about',
	template: '<div>about</div>'
})
export class About {	
}

@Module()
@States({
	'home': { url: '/', abstract: true, view: Home },
	'about': { url: '/about', parent:'home', view: About }
})
export class TestModule1 {
}

export var teste1expectedConfigForHome = {
	name: 'home',
	url: '/',
	abstract: true,
	views: {
		'' : {
			controller: Home,
			controllerAs: 'home',
			template: '<div>home</div>'
		}
	}	
};

export var teste1expectedConfigForAbout = {
	name: 'about',
	url: '/about',
	parent: 'home',
	views: {
		'' : {
			controller: About,
			controllerAs: 'about',
			template: '<div>about</div>'
		}
	}	
};