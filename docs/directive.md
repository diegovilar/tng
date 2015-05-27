# TNG
___

## Directive

* Decorador: `@Directive`
* Não possui `Template` (vide `Component`)
* A classe é o seu controller (ou `ViewModel`)
* Uma função de compilação, invocada com `$inject.invoke()`, pode ser referenciada na opção `compile`
* Para as funções referenciadas em `compile`, há injeções locais adicionais disponíveis:
  * `element`: elemento template onde a diretiva foi declarada
  * `attributes`: lista normalizada de atributos nesse elemento template, compartilhada com as demais
    diretivas do elemento
* Uma função de ligação, invocada com `$inject.invoke()`, pode ser referenciada na opção
  `link`. Para esta função, estão disponíveis as seguintes injeções locais:
  * `element`: instancia do elemento, onde a diretiva será usada
  * `attributes`: lista normalizada de atributos nesse elemento, compartilhada com as demais diretivas
     do elemento
  * `scope`: escopo a ser usado pela diretiva
  * `controller`: TODO
  * `transclude`: TODO
* Com exceção de `controller`, as injeções locais disponíveis a `link` também estão disponíveis à classe
* ??? Tornar PrePost injetáveis tb?
* ??? Lifecycle? Poderíamos permiter onDestroy (notificar se nao tiver `scope` próprio)