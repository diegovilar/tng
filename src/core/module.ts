import {AnimationAnnotation, registerAnimation} from "./animation";
import {ComponentAnnotation, publishComponent} from "./component";
import {ConstantWrapper, publishConstant} from "./constant";
import {DecoratorAnnotation, publishDecorator} from "./decorator";
import {DirectiveAnnotation, publishDirective} from "./directive";
import {FilterAnnotation, registerFilter} from "./filter";
import {ServiceAnnotation, publishService} from "./service";
import {TFunctionReturningNothing, setIfInterface} from "./utils";
import {ValueWrapper, publishValue} from "./value";
import {create, isArray, isFunction, isString} from "./utils";
import {getAnnotations, hasAnnotation, makeDecorator, mergeAnnotations} from "./reflection";

// TODO debug only?
// import * as angular from "angular";
import {assert} from "./assert";
import {safeBind} from "./di";

const PUBLISHED_ANNOTATION_KEY = "tng:module-published-as";

export type Dependency = string|Function|ConstantWrapper<any>|ValueWrapper<any>;
export type DependenciesArray = (Dependency|Dependency[])[];

/**
 * Options available when decorating a class as a module
 * TODO document
 */
export interface ModuleOptions {
    name?: string;
    dependencies?: DependenciesArray;
    config?: Function|Function[];
    run?: Function|Function[];

    // modules?: (string|Function)[];
    // components?: Function[];
    // services?: Function[];
    // filters?: Function[];
    // decorators?: Function[];
    // animations?: Function[];
    // values?: Function[];
    // constants?: Function[];
}

/**
 * @internal
 */
export class ModuleAnnotation {

    name: string = void 0;
    dependencies: DependenciesArray = void 0;
    config: Function|Function[] = void 0;
    run: Function|Function[] = void 0;

    // modules: (string|Function)[] = void 0;
    // components: Function[] = void 0;
    // services: Function[] = void 0;
    // filters: Function[] = void 0;
    // decorators: Function[] = void 0;
    // animations: Function[] = void 0;
    // values: Function[] = void 0;
    // constants: Function[] = void 0;

    constructor(options?: ModuleOptions) {
        setIfInterface(this, options);
    }

}

/**
 * Interface modules MAY implement
 * TODO document
 */
export interface Module {
    onConfig?: TFunctionReturningNothing;
    onRun?: TFunctionReturningNothing;
}

/**
 * @internal
 */
export interface ModuleConstructor extends Function {
    new (): Module;
    new (ngModule: ng.IModule): Module;
}

type ModuleSignature = (options?: ModuleOptions) => ClassDecorator;

/**
 * A decorator to annotate a class as being a module
 */
export var Module = <ModuleSignature> makeDecorator(ModuleAnnotation);

let moduleCount = 0;

function getNewModuleName() {

    return `tng_generated_module#${++moduleCount}`;

}

/**
 * @internal
 */
export function publishModule(moduleClass: ModuleConstructor, name?: string,
                              dependencies?: DependenciesArray,
                              constructorParameters?: any[]): ng.IModule {

    let aux: ModuleAnnotation[] = getAnnotations(moduleClass, ModuleAnnotation);

    // TODO debug only?
    assert.notEmpty(aux, "Missing @Module decoration");

    // Has this module already been published?
    let publishedAs = Reflect.getOwnMetadata(PUBLISHED_ANNOTATION_KEY, moduleClass);
    if (publishedAs) {
        return angular.module(publishedAs);
    }

    // special merging for dependencies, run and config
    if (aux.length > 1) {
        let mergedArrays = new ModuleAnnotation({
            dependencies: [],
            run: [],
            config: [],
        });

        for (let module of aux) {
            if (module.dependencies) {
                for (let dependency of module.dependencies) {
                    // We don't repeat dependencies
                    if (mergedArrays.dependencies.indexOf(dependency) === -1) {
                        mergedArrays.dependencies.push(dependency);
                    }
                }
            }

            if (module.run) {
                let _run = isArray(module.run) ? module.run : [module.run];
                for (let run of _run) {
                    (<Function[]> mergedArrays.run).push(run);
                }
            }

            if (module.config) {
                let _config = isArray(module.config) ? module.config : [module.config];
                for (let config of _config) {
                    (<Function[]> mergedArrays.config).push(config);
                }
            }
        }
        aux.push(mergedArrays);
    }


    let annotation = mergeAnnotations<ModuleAnnotation>(Object.create(null), ...aux);

    let constants: any[] = [];
    let values: any[] = [];
    let services: any[] = [];
    let decorators: any[] = [];
    let filters: any[] = [];
    let animations: any[] = [];
    let components: any[] = [];
    let directives: any[] = [];
    let modules: any[] = [];

    // TODO optimize this.. too much reflection queries
    function processDependency(dep: Dependency|Dependency[]): void {

        // Regular angular module
        if (isString(dep)) {
            modules.push(dep);
        }
        else if (isArray(dep)) {
            for (let _dep of <Dependency[]> dep) {
                processDependency(_dep);
            }
        }
        else if (hasAnnotation(dep, ModuleAnnotation)) {
            modules.push(publishModule(<ModuleConstructor> dep).name);
        }
        else if (dep instanceof ConstantWrapper) {
            constants.push(dep);
        }
        else if (dep instanceof ValueWrapper) {
            values.push(dep);
        }
        else if (hasAnnotation(dep, ServiceAnnotation)) {
            services.push(dep);
        }
        else if (hasAnnotation(dep, DecoratorAnnotation)) {
            decorators.push(dep);
        }
        else if (hasAnnotation(dep, FilterAnnotation)) {
            filters.push(dep);
        }
        else if (hasAnnotation(dep, AnimationAnnotation)) {
            animations.push(dep);
        }
        else if (hasAnnotation(dep, ComponentAnnotation)) {
            components.push(dep);
        }
        else if (hasAnnotation(dep, DirectiveAnnotation)) {
            directives.push(dep);
        }
        else {
            // TODO WTF?
            throw new Error(`I don't recognize what kind of dependency this is: ${dep}`);
        }

    }

    let allDeps = [].concat(
        (annotation.dependencies || []),
        (dependencies || [])
    );

    allDeps.forEach((dep) => processDependency(dep));

    name = name || annotation.name || getNewModuleName();

    // Register the module on Angular
    let ngModule = angular.module(name, modules);

    // Instantiate the module
    // var module = new moduleClass(ngModule);
    let module = Object.create(moduleClass.prototype);
    moduleClass.apply(module, [ngModule].concat(constructorParameters || []));

    // Register config functions
    let configFns: Function[] = [];
    if (isFunction(module.onConfig)) configFns.push(safeBind(module.onConfig, module));
    if (annotation.config) {
        if (isFunction(annotation.config)) configFns.push(<Function> annotation.config);
        else if (isArray(annotation.config)) configFns = configFns.concat(<Function[]> annotation.config);
    }
    for (let fn of configFns) ngModule.config(fn);

    // Register initialization functions
    let runFns: Function[] = [];
    if (isFunction(module.onRun)) runFns.push(safeBind(module.onRun, module));
    if (annotation.run) {
        if (isFunction(annotation.run)) runFns.push(<Function> annotation.run);
        else if (isArray(annotation.run)) runFns = runFns.concat(<Function[]> annotation.run);
    }
    for (let fn of runFns) ngModule.run(fn);

    /* tslint:disable rule:curly */
    for (let item of values) publishValue(item, ngModule);
    for (let item of constants) publishConstant(item, ngModule);
    for (let item of filters) registerFilter(item, ngModule);
    for (let item of animations) registerAnimation(item, ngModule);
    for (let item of services) publishService(item, ngModule);
    for (let item of decorators) publishDecorator(item, ngModule);
    for (let item of components) publishComponent(item, ngModule);
    for (let item of directives) publishDirective(item, ngModule);
    /* tslint:enable */

    Reflect.defineMetadata(PUBLISHED_ANNOTATION_KEY, name, moduleClass);

    return ngModule;

}