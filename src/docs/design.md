# TNG
___

## Visão geral

### Application

* Classe decorada com `@Application`
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
    class TodoApp {
        
        onRun(@Inject('storage') storage:Storage) {
            storage.clean();
        }
        
    }
    
    bootstrap(TodoApp);
```


### Module

* Classe decorada com `@Module`
* Equivalente a um módulo do Angular, agregando submódulos, serviços e componentes
* Permite configuração através...

Exemplos:

`Arquivo: app/concrete/components.ts`
```js
    import {Module} from 'tng';
    import {Todo} from './components/todo';
    import {TodoItem} from './components/todo-item';
    
    @Module({
        dependencies: ['ui.bootstrap', Todo, TodoItem]
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
    export class Services {
                
        onConfig(@Inject('$cookiesProvider') $cookiesProvider: ng.cookies.ICookiesServiceProvider) {
            ...
        }
        
    }
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

### Components

* Decorator: `@Component`
* São diretivas
* A classe do component é o ViewModel (controller) do component
* Templates, se necessários, podem ser fornecidos pelo decorador `@View`:
  * através da anotação `template`, podendo ser:
    * uma string representando o template
    * uma função a ser invocada com `$injector.invoke()` e que retorna uma string representando o template 
  * através da anotação `templateUrl`, podendo ser:
    * uma string contendo URL para o arquivo do template
    * uma função a ser invocada com `$injector.invoke()` e que retorna uma string contendo a URL
* Uma função de compilação, invocada com `$inject.invoke()`, pode ser fornecida por um método estático
  `compile()` na classe do componente
* Para a função de compílação `compile()` e as funções referenciadas a `template` ou `templateUrl`,
  há injeções locais disponíveis:
  * `element`: elemento template onde a diretiva foi declarada
  * `attributes`: lista normalizada de atributos nesse elemento template, compartilhada com as demais
    diretivas do elemento
* Uma função de ligação, invocada com `$inject.invoke()`, pode ser fornecida por um método estático
  `link()` na classe do componente. Para esta função, estão disponíveis as seguintes injeções locais:
  * `element`: instancia do elemento, onde a diretiva será usada
  * `attributes`: lista normalizada de atributos nesse elemento, compartilhada com as demais diretivas
     do elemento
  * `scope`: escopo a ser usado pela diretiva
  * `controller`: TODO
  * `transclude`: TODO
* Com exceção de `controller`, as injeções locais acima também estão disponíveis ao construtor do componente
  (ViewModel)

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

### Animation

### Filter

### Controller??

## Extensão de anotações

TODO anotações são herdadas?

```js
    import {Component} from 'tng';
    import {TodoItem} from './todo-item';

    @Component.inheritsFrom(TodoItem)
    @Component({
        selector: 'todo-item',
        require: ['^todo']
    })
    @View({
        controllerAs: 'item',
        template: '<div class="todo-item"></div>'
    })
    export class GoldenTodoItem extends TodoItem {
        ...
    }
```