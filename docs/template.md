# TNG
___

## Template

Descreve um template a ser aplicado a uma `View` ou `Component`.

* Decorador: `@Template`
* Opções:
  * `controllerAs:string`: Identificador pelo qual o controller será referenciado no template
  * `inline:string|function`
    * Quando string, representando é próprio template
    * Quando função, será invocada com `$injector.invoke()` e deve retorna uma string representando o template
  * `url:string|function`
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
	@Template({
		controllerAs: 'panel',
		url: 'panel.html'
	})
	export class Panel {
	}
```


#### 2) View

```js
	@View
	@Template({
		controllerAs: 'home',
		inline: '<div>{{ home.greetings }}</div>'
	})
	export class Home {
		greetings = 'Hello World!'
	}
```