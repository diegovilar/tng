View Annotation
===============

Basic use in a component:

```typescript
    @Component({
        selector: 'panel'
    })
    @View({
        controllerAs: 'panel'
        template: '<div>{{ panel.content }}</div>'
    })
    class Panel {
        content = "I'm a panel";
    }
```