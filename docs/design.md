# TNG
___

## Visão geral

### Application

* Decorador: `@Application`
* É um `Module`, mas com uma notação de seletor que indica o elemento base da aplicação
  
Exemplo:

`app/app.ts`
```js
    import {Application, Inject, Constant} from 'tng';
    import {Components} from './concrete/components';
    import {Services} from './concrete/services';
    import {Storage} from './abstract/services/storage';
    
    var version = Constant('version', '1.3.2');
    
    @Application({
        selector: 'html',
        dependencies: ['ngRoute', Components, Services, version]
    })
    class TodoApp implements Application {
        
        onRun(@Inject('storage') storage:Storage) {
            storage.clean();
        }
        
    }
    
    bootstrap(TodoApp);
```



### Module

* Dacorador: `@Module`
* Equivalente a um módulo do Angular, agregando submódulos, serviços e componentes
* Permite fornecer funções de configuração:
  * através da anotação `config` em `@Module`
  * através de método `onConfig()` implementado na classe do módulo
* Permite fornecer funções de inicializaão:
  * através da anotação `run` em `@Module`
  * através de método `onRun()` implementado na classe do módulo
* Informa-se outros módulos, serviços, componentes, decoradores, filtros, animacoes,
  valores e constantes através da anotação `dependencies` me `@Module`
* Pode-se depender de outros módulos regulares, não implementados usando TNG, bastando apenas
  informar seus nomes em `dependencies`

Exemplos:

`Arquivo: app/concrete/components.ts`
```js
    import {Module} from 'tng';
    import {Todo} from './components/todo';
    import {TodoItem} from './components/todo-item';
    
    @Module({
        dependencies: ['ui.bootstrap', Todo, TodoItem],
        config: [...]
    })
    export class Components {}
```

`Arquivo: app/concrete/services.ts`
```javascript
    import {Module, Inject} from 'tng';
    import {Storage} from './services/storage';
    
    @Module({
        dependencies: ['ngCookies', Storage]
    })
    export class Services implements Module {
                
        onConfig(@Inject('$cookiesProvider') $cookiesProvider: ng.cookies.ICookiesServiceProvider) {
            ...
        }
        
    }
``` 



### Constants

* Decorador: `@Constant`

```js
    import {Constant, Module} from 'tng';
    
    var version = Constant('version', '1.2.3');
    
    @Module({
        dependencies: [version]
    })
    ...
```



### Values

* Decorador: `@Value`

```js
    import {Value, Module} from 'tng';
    
    var state = Value('state', {current: 'stoped', next: 'moving'});
    
    @Module({
        dependencies: [state]
    })
    ...
```



### Services

* Decorator: `@Service`
* Diferentemente de `angular.Module.service()`, que constrói o serviço com `new`,
  são construídos com `$injector.instantiate()`, e portanto seus construtores podem receber
  injeções
* Podem também ser construídos por uma fábrica, referenciada pela anotação `factory` em `@Service` e
  invocada por `$injector.invoke()` (vide https://docs.angularjs.org/api/auto/service/$provide#factory)
* Podem ainda ser fornecidos por um provedor, referenciado pela anotação `provider` em `@Service` e
  invocada por `$injector.invoke()` (vide https://docs.angularjs.org/api/auto/service/$provide#provider)

Exemplos:

`Arquivo: app/concrete/services/storage.ts`
```javascript
    import {Module, Inject} from 'tng';
    
    @Service({
        name: 'storage'
    })
    export class Storage {
        
        private $cookies: ng.cookies.ICookiesService;
        
        // Dependências são injetáveis no construtor
        constructor(@Inject('$cookies') $cookies:ng.cookies.ICookiesService) {
            this.$cookies = $cookies;
        }

        read(key: string):any {
            ...
        }
        
        write(key: string, value:any) {
            ...
        }
        
        clean() {
            ...
        }

    }
```



### Directive

* Decorador: `@Directive`
* Não possui `@View` (use `@Component`)
* Não podem ser roteadas (`@Route`)

### Components

* Decorator: `@Component`
* São diretivas que possuem templates, e têm algumas opções forçadas:
  * Para `@Component`:
    * scope é orbigatório, ou `true` ou `{}`, sendo `true` o padrão
    * ??? bindToController 
  * Exige `@View` e algum template informado 
* Podem ser roteadas (`@Route`)  
* A classe do component é o ViewModel (controller) do component
* Templates, se necessários, podem ser fornecidos pelo decorador `@View`:
  * através da anotação `template`, podendo ser:
    * uma string representando o template
    * uma função a ser invocada com `$injector.invoke()` e que retorna uma string representando o template 
  * através da anotação `templateUrl`, podendo ser:
    * uma string contendo URL para o arquivo do template
    * uma função a ser invocada com `$injector.invoke()` e que retorna uma string contendo a URL
* Uma função de compilação, invocada com `$inject.invoke()`, pode ser referenciada na anotação
  `compile` em `@Component`
* Para a função as funções referenciadas em `compile`, `template` e `templateUrl`,
  há injeções locais disponíveis:
  * `element`: elemento template onde a diretiva foi declarada
  * `attributes`: lista normalizada de atributos nesse elemento template, compartilhada com as demais
    diretivas do elemento
* Uma função de ligação, invocada com `$inject.invoke()`, pode ser referenciada na anotação
  `link` em `@Component`. Para esta função, estão disponíveis as seguintes injeções locais:
  * `element`: instancia do elemento, onde a diretiva será usada
  * `attributes`: lista normalizada de atributos nesse elemento, compartilhada com as demais diretivas
     do elemento
  * `scope`: escopo a ser usado pela diretiva
  * `controller`: TODO
  * `transclude`: TODO
* Com exceção de `controller`, as injeções locais disponíveis a `link` também estão disponíveis ao construtor do componente
  (ViewModel)
* ??? Tornar PrePost injetáveis tb?
* ??? Lifecycle? Poderíamos permiter onDestroy (notificar se nao tiver escopo próprio)

`Arquivo: app/concrete/components/todo.ts`
```javascript
    import {Component, View, Inject} from 'tng';
    import {Storage} from './abstract/services/storage';
    
    @Component({
        selector: 'todo'
    })
    @View({
        controllerAs: 'todo',
        template: '<div class="todo"></div>'
    })
    export class Todo {
        
        private storage: Storage;
        private element: ng.IJqueryElement;
        
        constructor(@Inject('storage') storage: Storage
                    @Inject('element') element: ng.IJqueryElement) {
            this.storage = storage;
            this.element = element;
        }
        
        static link(@Inject('scope') scope: ng.IScope,
                    @Inject('element') element: ng.IJqueryElement) {
            ...
        }
        
        add() {
            ...
        }

    }
```

`Arquivo: app/concrete/components/todo-item.ts`
```js
    import {Component, View} from 'tng';
    
    @Component({
        selector: 'todo-item',
        require: ['^todo']
    })
    @View({
        controllerAs: 'item',
        template: '<div class="todo-item"></div>'
    })
    export class TodoItem {
        ...
    }
```



### Decorator

* Decorador: `@Decorator`
* Instanciado com `$injector.instantiate()`
* Tanto o construtor quanto `decorate()` recebem injeções
* `decorate()` deve retornar o serviço decorado

```js
    import {Decorator, Inject} from 'tng';
    
    @Decorator({
        name: 'storage'
    })
    class StorageDecorator implements Decorator {
        
        // Injectable
        constructor() {
            ...
        }
                
        // Injectable
        decorate(@Inject('$delegate') $delegate: any): any {
            ...
        }
        
    }
```



### Animation

* Decorator: `@Animation`
* Singleton
* Instanciado com `$injector.instantiate()`

```js
    import {Animation} from 'tng';
    
    @Animation({
        name: 'fade'
    })
    class FadeAnimation implements Animation {
        
        // Injectable
        constructor() {
            ...
        }
        
        ...
    }    
```



### Filter

* Decorator: `@Filter`
* Singleton
* Instanciado com `$injector.instantiate()`

```js
    import {Filter, Inject} from 'tng';
    
    @Filter({
        name: 'orderBy'
    })
    class OrderByFilter implements Filter {
        
        // Injectable
        constructor() {
            ...
        }
        
        // Not injectable
        filter(input: any, ...args: any[]): any {
            ...
        }
        
    }
```



### Controller??

TODO necessário? Acho que não...



## Extensão de anotações

* Anotações são herdadas quando se extende uma classe
* Pode-se extrair as anotações manualmente:
  * `var annotations = Component.inheritsFrom(sourceClass)`
    * Extracts annotations made with `Component` for imperative use
  * `@Component.inheritsFrom(sourceClass)`
    * Extracts annotations made with `Component` and applies them to the target class

Automatic inheriting annotations:

```js
    import {Component} from 'tng';
    import {TodoItem} from './todo-item';

    // GoldenTodoItem automaticly inherits annotations from TodoItem
    // Adds new annotations do override inherited ones  
    @Component({
        selector: 'golden-todo-item'
    })
    @View({
        controllerAs: 'item',
        template: '<div class="golden-todo-item"></div>'
    })
    export class GoldenTodoItem extends TodoItem {
        ...
    }
```

Manualy inherting annotations:

```js
    import {Component} from 'tng';
    import {TodoItem} from './todo-item';

    @Component.inheritsFrom(TodoItem)
    @Component({
        selector: 'golden-todo-item'
    })
    @View({
        controllerAs: 'item',
        template: '<div class="golden-todo-item"></div>'
    })
    export class GoldenTodoItem {
        ...
    }
```



### Obtendo versão crua de um módulo para uso da API Angular

```js
    import {Module} from 'tng';
    import {Services} from './concrete/services';
    
    var rawModule = Module.unwrap(Services, 'services');
    rawModule.controller(...);
    rawModule.service(...);
    rawModule.directive(...);
```



# Router

## Exemplos

### 1) Rota definida estaticamente no componente

`index.html`
```html
    <div ng-outlet="main"></div>
```

`greetings.ts`
```js
    @RouteConfig({
        name: 'greetings',              // state.name
        path: '/greetings/:name',       // state.url
        outlet: 'main'                  // state.views = { 'main' : {controller: ...} }
    })
    @Component({
        selector: 'greetings'
    })
    @View({
        controllerAs: 'greetings',
        template: '{{ greetings.message }}'
    })    
    export class Greetings {
        message = 'Hello, {name}!';
        constructor($routeParams) {
            this.message = this.message.replace('{name}', $routeParams['name']);
        }
    }
```

`app.ts`
```js
    import {Greetings} from './greetings.ts';
    
    @Application({
        selector: 'html',
        dependencies: [Greetings]
    })
    export class App {
    }    
```

Acesso a `/greetings/Diego`, renderiza...

```html
    <div ng-outlet="main">
        <greetings>Hello, Diego!</greetings>
    </div>    
```


### 2) Rota definida na configuração do módulo

`index.html`
```html
    <div ng-outlet></div>
```

`greetings.ts`
```js
    @View
    @Template({
        controllerAs: 'greetings',
        inline: '{{ greetings.message }}'
    })
    export class Greetings {
        message = 'Hello, {name}!';
        constructor($routeParams) {
            this.message = this.message.replace('{name}', $routeParams['name']);
        }
    }
```

`app.ts`
```js
    import {Greetings} from './greetings.ts';
    import {Dashboard} from './dashboard.ts';
    import {Logout} from './dashboard.ts';
    
    @Application({
        selector: 'html',
        dependencies: [Greetings]
    })
    @States([
        {name: 'greetings', path: '/greetings/:name', component: Greetings},
        // state = {name: 'greetings', url: '/greetings/:name', views: {'@' : {controller: Greetings...}}}
        
        {name: 'logout', path: '/logout', components: {'@' : Logout}},
        // state = {name: 'logout', url: '/logout', views: {'@' : {controller: Logout...}}}
        
        {name: 'dashboard', path: '/dashboard', component: Dashboard, states: [
            {name: 'config', path: '/config', component: 'config'},
            {name: '', path: '', component: ''}
        ]}
        // state = {name: 'dashboard', url: '/dashboard', views: {'@' : {controller: Dashboard...}}}
        
    ])
    export class App {
    }    
```

Acesso a `/greetings/Diego`, renderiza...

```html
    <div ng-outlet>
        <greetings>Hello, Diego!</greetings>
    </div>    
```

## Exemplo com Aninhamento

- Nome da rota: `dashboard`
- URL: `/dashboard`

```html
    <div ng-outlet="main"></div>
```

```js
    import {Greetings} from  './greetings';
    
    @Route({
        name: 'dashboard',
        path: '/dashboard',
        outlet: 'main',
        components: {
            content: Greetings, // Greetings é um componente 
            aside: 'search'     // 'search' = seletor de um component 
        }
    })
    @Component({
        selector: 'dashboard'
    })
    @View({
        controllerAs: 'dashboard',
        template: '<div ng-outlet="content"></div><div ng-outlet="aside"></div>'
    })    
    class Dashboard {
        message = 'Hello, {name}!';
        constructor($routeParams) {
            this.message = this.message.replace('{name}', $routeParams['name']);
        }
    }
```

Acesso a `/dashboard`, renderiza...

```html
    <div ng-outlet="main">
        <dashboard>
            <div ng-outlet="content">
                <greetings>Hello, Diego!</greetings>
            </div>
            <div ng-outlet="aside">
                <search></search>
            </div>
        </dashboard>
    </div>    
```