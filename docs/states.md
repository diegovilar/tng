# TNG
___

## UIStates

Configura.

* Decorador: `@UIStates`
* Requer `Template`
* A classe é o seu controller (ou `ViewModel`)

### Exemplos de uso

#### 1) Exemplo básico

`index.html`
```html
	<html>
		<body>
			<div view-outlet></div>
		</body>		
	</html>
```

`app.js`
```js
	import {View, Template, Application, States} from 'tng';

	@View
	@Template({
		controllerAs: 'home',
		inline: '<div>{{ home.greetings }}</div>'
	})
	export class Home {
		greetings = 'Hello World!'
	}
	
	@Application({
		selector: 'html'
	})
	@States([
		{name: 'home', path: '/', view: Home}
	])
	class MyApp {
	}
```


#### 2) Views irmãs

`index.html`
```html
	<html>
		<body>
			<div view-outlet="content"></div>
			<div view-outlet="aside"></div>
		</body>		
	</html>
```

`app.js`
```js
	import {View, Template, Application, States} from 'tng';

	@View
	@Template({
		controllerAs: 'home',
		url: 'home.html'
	})
	export class Home {
		...
	}
	
	@View
	@Template({
		controllerAs: 'menu',
		url: 'menu.html'
	})
	export class Menu {
		...
	}
	
	@Application({
		selector: 'html'
	})
	@States([
		{name: 'home', path: '/', views: {'content': Home, 'aside': Menu}}
	])
	class MyApp {
	}
```


#### 3) Subestados e views aninhadas

`index.html`
```html
	<html>
		<body>
			<div view-outlet></div>
		</body>		
	</html>
```

`app.js`
```js
	import {View, Template, Application, States} from 'tng';
	import {Welcome} from './welcome';
	import {Search} from './search';
	import {Config} from './config';

	@View
	@Template({
		controllerAs: 'dashboard',
		inline: '<h1>Your Dashboard</h1>' +
		        '<div view-outlet="content"></div>' +
		        '<div view-outlet="aside"></div>'
	})
	export class Dashboard {
		...
	}
	
	@View
	@Template({
		controllerAs: 'menu',
		inline: 'menu.html'
	})
	export class Menu {
		...
	}
	
	@Application({
		selector: 'html'
	})
	
	@UIStates({
		'dashboard':        {path: '/dashboard', abstract: true, view: Dashboard}
		'dashboard.start':  {path: '/', views: {'content': Welcome, 'aside': Search}},
		'dashboard.config': {path: '/config', views: {'content': Config}}
	}}
	// or
	@UIStates({
		'dashboard': {path: '/dashboard', abstract: true, view: Dashboard}
		'start':     {parent: 'dashboard', path: '/', views: {'content': Welcome, 'aside': Search}},
		'config':    {parent: 'dashboard', path: '/config', views: {'content': Config}}
	}}
	
	@Routes({
		''  : '/index',
		'?' : '/not-found'
	})
	class MyApp {
	}
```