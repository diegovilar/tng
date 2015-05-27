# TNG
___

## Component

* Decorator: `@Component`
* São `Directvies` com algumas opções forçadas:
  * `scope` é orbigatório, ou `true` ou `{}`, sendo `true` o padrão
  * ??? bindToController 
  * Exige um `Template`
* As injeções locais disponíveis a `compile` também estão disponíveis a `inline` e `url`
  de `Template`

`Arquivo: app/concrete/components/todo.ts`
```js
    import {Component, Template, Inject} from 'tng';
    import {Storage} from './abstract/services/storage';
    
    @Component({
        selector: 'todo',
        link: Todo.link
    })
    @Template({
        controllerAs: 'todo',
        inline: '<div class="todo"></div>'
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
    import {Component, Template} from 'tng';
    
    @Component({
        selector: 'todo-item',
        require: ['^todo']
    })
    @Template({
        controllerAs: 'item',
        inline: '<div class="todo-item"></div>'
    })
    export class TodoItem {
        ...
    }
```