# TNG
___

## View

Views são telas de um estado.

* Decorador: `@View`
* Requer `Template`
* A classe é o seu controller (ou `ViewModel`)

### Exemplos de uso

```js
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