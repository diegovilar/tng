# TNG
___

## States

Configura estados no UI-Router em um controller de aplicação.

* Decorador: `@States`
* Requer `View`

### Exemplos de uso

#### 1) Exemplo básico

`index.html`
```html
	<html>
		<body>
			<div ui-view></div>
		</body>		
	</html>
```

`app.js`
```js
	import {View, Application, States} from 'tng';
	import {States, Routes} from 'tng/ui-router';

	@View({
		controllerAs: 'home',
		template: '<div>{{ home.greetings }}</div>'
	})
	export class Home {
		greetings = 'Hello World!'
	}
	
	@Application({
		selector: 'html',
		dependencies: ['ui.router']
	})
	@States({
		'home': {path: '/', view: Home}
	})
	class MyApp {
	}
```


#### 2) Views irmãs

`index.html`
```html
	<html>
		<body>
			<div ui-view="content"></div>
			<div ui-view="aside"></div>
		</body>		
	</html>
```

`app.js`
```js
	import {View, View, Application} from 'tng';
	import {States, Routes} from 'tng/ui-router';

	@View({
		controllerAs: 'home',
		templateUrl: 'home.html'
	})
	export class Home {
		...
	}
	
	@View({
		controllerAs: 'menu',
		templateUrl: 'menu.html'
	})
	export class Menu {
		...
	}
	
	@Application({
		selector: 'html',
		dependencies: ['ui.router']
	})
	@States({
		'home': {path: '/', views: {'content': Home, 'aside': Menu}}
	})
	class MyApp {
	}
```


#### 3) Subestados e views aninhadas

`index.html`
```html
	<html>
		<body>
			<div ui-view></div>
		</body>		
	</html>
```

`app.js`
```js
	import {View, Application, States} from 'tng';
	import {States, Routes} from 'tng/ui-router';
	import {Welcome} from './welcome';
	import {Search} from './search';
	import {Config} from './config';

	@View({
		controllerAs: 'dashboard',
		template: '<h1>Your Dashboard</h1>' +
		          '<div ui-view="content"></div>' +
		          '<div ui-view="aside"></div>'
	})
	export class Dashboard {
		...
	}
	
	@View({
		controllerAs: 'menu',
		templateUrl: 'menu.html'
	})
	export class Menu {
		...
	}
	
	@States({
		'dashboard':        {path: '/dashboard', abstract: true, view: Dashboard}
		'dashboard.start':  {path: '/', views: {'content': Welcome, 'aside': Search}},
		'dashboard.config': {path: '/config', views: {'content': Config}}
	}}
	// OR
	@States({
		'dashboard': {path: '/dashboard', abstract: true, view: Dashboard}
		'start':     {parent: 'dashboard', path: '/', views: {'content': Welcome, 'aside': Search}},
		'config':    {parent: 'dashboard', path: '/config', views: {'content': Config}}
	}}
	
	@Routes({
		''  : '/index',
		'?' : '/not-found'
	})
	
	@Application({
		selector: 'html',
		dependencies: ['ui.router']
	})
	
	class AppController {
		...
	}
```