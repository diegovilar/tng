Component Annotation
====================

Basic usage:

```typescript
    @Component({
        selector: 'todo'
    })
    @View({
        controllerAs: 'todo'
        template: '<div>{{ todo.content }}</div>'
    })
    class Todo {
        content = "I'm a Todo";
    }
```

`Todo` is a component (directive) that will be instantiated whenever
`<todo></todo>` or `<div class="todo"></div>` is found in the application DOM.

By default, components instantiate a new `scope` (`scope: true`) and and bind to the
controller (`bindToController: true`).

The most basic component needs only a `@Component` annotation providing the `selector`,
a `@View`annotation providing the name the controller will be refered in the template
(`controllerAs`), and a template for the component. Everything other configuration
Angular needs to create a directive is provided using default values.

`template` is one of many ways a template might be provided, either through the `@View`
annotation or through implementations on the controller itself.

Examples:

1. Through `@View`:
```typescript
	@View({
		template: '<div>{{ todo.content }}</div>',	// or
		templateUrl: 'todo.html'
	})
```


2. Through implementation:

A more complex usage example:

```typescript
    @Component({
        selector: 'todo-item',
		require: ['^todo'],
    })
    @View({
        controllerAs: 'item'
        template: '<div>{{ item.content }}</div>'
    })
    class TodoItem {
        content = "I'm a panel";
		
		constructor(@Inject('$element') private $element:ng.IJqueryElement,
					@Inject('$q') private $q:ng.IQService) {
			...
		}
		
		static link(@Inject('$scope') $scope:ng.IScope,
		            @Inject('$element') $element:ng.IJqueryElement) {
			...
		}
    }
```

`Panel` is a component (directive) that will be instantiated whenever
`<panel></panel>` or `<div class="panel"></div>` is found in the application DOM.

