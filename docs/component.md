# TNG
___

## Component

* Decorator: `@Component`
* São `Directvies` com algumas opções forçadas:
  * `scope` é orbigatório, ou `true` ou `{}`, sendo `true` o padrão
  * ??? bindToController 
  * Requer `View`
* As injeções locais disponíveis a `compile` também estão disponíveis a `template` e `templateUrl`
  de `View`

`Arquivo: app/concrete/components/todo.ts`
```js
    import {Component, View, Inject} from 'tng';
    import {Storage} from './abstract/services/storage';
    
    @Component({
        selector: 'todo',
        link: Todo.link
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