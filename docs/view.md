# TNG
___

## View

Anota um controller com informações sobre uma view, podendo ser usado em states ou components.

* Decorador: `@View`
* Opções:
  * `controllerAs:string`: Identificador pelo qual o controller será referenciado no template
  * `template:string|function`
    * Quando string, representando é próprio template
    * Quando função, será invocada com `$injector.invoke()` e deve retorna uma string representando o template
  * `templateUrl:string|function`
    * Quando string, representando a URL do template
    * Quando função, será invocada com `$injector.invoke()` e deve retorna a URL do template
  * `stylesheetUrl:string|function`
    * Quando string, representando a URL da folha de estilos do template
    * Quando função, será invocada com `$injector.invoke()` e deve retorna a URL da folha de estilos do template

### Exemplos de uso

#### 1) Component

```js
	@Component({
		selector: 'panel'
	})
	@View({
		controllerAs: 'panel',
		templateUrl: 'panel.html'
	})
	export class Panel {
	}
```


#### 2) State

```js
	@View({
		controllerAs: 'home',
		template: '<div>{{ home.greetings }}</div>'
	})
	export class Home {
		greetings = 'Hello World!'
	}
	
	@Application({
		selector: 'html'
	})
	@States({
		'home': {path: '/', view: Home}
	})
	export class AppController {
	}
```