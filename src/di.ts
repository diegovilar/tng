/// <reference path="./_references.ts" />



/**
 * Annotates a function with information of dependencies to be injected as parameters
 *
 * * Overrides previous annotation (logs warning)
 * * All parameters should be annotated (logs warning)
 * * Dependencies will be injected in the order they are specified in the dependencies parameter
 *
 * @param dependencies Names of the dependencies to be injected, in order
 * @returns The provided function
 */
export function injectable<T extends Function>(dependencies: string[], func: T): T {

	// TODO warn about overriding annotation
	// TODO warn about mismatching number of parameters and dependencies

    func.$inject = dependencies.slice();
	return func;

}

/**
 * Binds a function to a context and preservers it's annotated dependencies
 *
 * @param func The function to be bound
 * @param context The object to which bind the funcion
 * @returns A bound function
 */
export function safeBind<T extends Function>(func: T, context: any): T {

    var bound = func.bind(context);

	if (func.$inject) {
		bound.$inject = func.$inject;
	}

    return bound;

}

/**
 * A decorator to annotate method parameterss with dependencies to be injected
 *
 * * Overrides previous annotation (logs warning)
 * * All parameters should be annotated (logs warning)
 *
 * @param dependency The name of the dependency to be injected
 */
export function Inject(dependency: string): ParameterDecorator {

	return (target: Function, propertyKey: string|symbol, parameterIndex: number) => {

		// TODO warn about overriding annotation
		// TODO warn about mismatching number of parameters and dependencies

        // If propertyKey is defined, we're decorating a parameter of a method
        // If not, we're decorating a parameter of class constructor
		target = (typeof propertyKey == 'undefined') ? target : target = (<any>target)[propertyKey];

		// TODO what about missing elements in the $inject array?
		// ie. annotated the 2nd but not the 1st parameter

		var $inject: string[] = (target.$inject = target.$inject || []);
		$inject[parameterIndex] = dependency;

	}

}

/**
 * Inspects a function for dependency injection annotation
 *
 * @param func The object to be inspected
 */
export function isAnnotated(func: Function): boolean {

	return func && func.hasOwnProperty('$inject');

}