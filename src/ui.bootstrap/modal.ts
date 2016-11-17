// TODO debug only?
// import * as angular from "angular";
import {Inject, injectable, __assert__ as assert, __utils__ as utils, __reflection__ as reflection} from 'angularts';
import {ModalViewAnnotation, MODAL_BACKDROP_MAP} from './modal-view'

import IModalServiceInstance = ng.ui.bootstrap.IModalServiceInstance
import IModalService = ng.ui.bootstrap.IModalService
import IModalSettings = ng.ui.bootstrap.IModalSettings
import IModalStackService = ng.ui.bootstrap.IModalStackService
import IModalScope = ng.ui.bootstrap.IModalScope

export {ModalView, ModalBackdrop, ModalViewOptions} from './modal-view'

let makeDecorator = utils.makeDecorator;
let create = utils.create;
let isDefined = utils.isDefined;
let isString = utils.isString;
let isFunction = utils.isFunction;
let isArray = utils.isArray;
let forEach = utils.forEach;
let setIfInterface = utils.setIfInterface;
import Map = utils.Map;

let hasAnnotation = reflection.hasAnnotation;
let getAnnotations = reflection.getAnnotations;
let mergeAnnotations = reflection.mergeAnnotations;



export interface ModalOptions {

    scope?: ng.IScope|IModalScope|{(...args: any[]): ng.IScope|IModalScope};
    bindToController?: boolean;
    // resolve?: Map<string|Function>;
    resolve?: Map<Function>;
    keyboard?: boolean;
    dismissAll?: boolean;

}

/**
 * @internal
 */
export class ModalAnnotation {

    scope: ng.IScope|IModalScope|{(...args: any[]): ng.IScope|IModalScope} = void 0;
    bindToController: boolean = true; // defautls to true; differs from the original
    // resolve: Map<string|Function> = void 0; // It doesn't really support strings, as stated in the docs
    resolve: Map<Function> = void 0;
    keyboard: boolean = void 0;
    dismissAll: boolean = void 0;

    constructor(options?: ModalOptions) {

        setIfInterface(this, options);

    }

}

type ModalDecorator = (options?: ModalOptions) => ClassDecorator;

/**
 * A decorator to annotate a class as being a modal controller
 */
export var Modal = <ModalDecorator> makeDecorator(ModalAnnotation);

/**
 * @internal
 */
export class ModalHandler {

    private instance: IModalServiceInstance = null;

    constructor(
        private modalNotes: ModalAnnotation,
        private viewNotes: ModalViewAnnotation,
        private settings: IModalSettings) {
    }

    open(
        @Inject('$injector') $injector: ng.auto.IInjectorService,
        @Inject('$modal') $modal: IModalService,
        @Inject('$modalStack') $modalStack: IModalStackService): IModalServiceInstance {

        var view = this.viewNotes;
        var modal = this.modalNotes;
        var calltimeSettings: IModalSettings = angular.copy(this.settings);

        if (modal.dismissAll) {
            $modalStack.dismissAll();
        }

        if (isDefined(modal.scope)) {
            calltimeSettings.scope = isFunction(modal.scope) ?
                $injector.invoke(<any> modal.scope) :
                    modal.scope;
        }

        if (isDefined(view.template)) {
            calltimeSettings.template = isFunction(view.template) ?
                $injector.invoke(<any> view.template) :
                    <string> view.template;
        }

        if (isDefined(view.templateUrl)) {
            calltimeSettings.templateUrl = isFunction(view.templateUrl) ?
                $injector.invoke(<any> view.templateUrl) :
                    view.templateUrl;
        }

        this.instance = $modal.open(calltimeSettings);
        return this.instance;

    }

    dismiss(@Inject('$modalStack') $modalStack: IModalStackService) {

        if (this.modalNotes.dismissAll) {
            $modalStack.dismissAll();
        }
        else {
            this.instance.dismiss();
        }

    }

}

/**
 * @internal
 */
export function getModalHandler(modalClass: Function, scope?: ng.IScope): ModalHandler {

    var modalNotes = getAnnotations(modalClass, ModalAnnotation);
    var viewNotes = getAnnotations(modalClass, ModalViewAnnotation);

    // TODO debug only?
    assert.assert(modalNotes, 'Missing @Modal decoration');
    assert.assert(viewNotes, 'Missing @ModalView decoration');

    var settings: ng.ui.bootstrap.IModalSettings = {
        controller: modalClass
    };

    var modal = <ModalAnnotation> {/*no defaults*/};
    mergeAnnotations(modal, ...modalNotes);

    // Deferred to be handled by ModalHandler to allow DI
    // if (isDefined(modal.scope)) {
    //     settings.scope = modal.scope;
    // }
    if (scope) {
        modal.scope = scope;
    }

    if (isDefined(modal.bindToController)) {
        settings.bindToController = modal.bindToController;
    }

    if (isDefined(modal.resolve)) {
        settings.resolve = modal.resolve;
    }

    if (isDefined(modal.keyboard)) {
        settings.keyboard = modal.keyboard;
    }

    var view = <ModalViewAnnotation> {/*no defaults*/};
    mergeAnnotations(view, ...viewNotes);

    if (isDefined(view.animation)) {
        settings.animation = view.animation;
    }

    if (isDefined(view.backdrop)) {
        settings.backdrop = MODAL_BACKDROP_MAP[view.backdrop];
    }

    if (isDefined(view.backdropClass)) {
        settings.backdropClass = view.backdropClass;
    }

    if (isDefined(view.keyboard)) {
        settings.keyboard = view.keyboard;
    }

    if (isDefined(view.windowClass)) {
        settings.windowClass = view.windowClass;
    }

    if (isDefined(view.windowTemplateUrl)) {
        settings.windowTemplateUrl = view.windowTemplateUrl;
    }

    if (isDefined(view.size)) {
        settings.size = view.size;
    }

    if (isDefined(view.controllerAs)) {
        settings.controllerAs = view.controllerAs;
    }

    // Deferred to be handled by ModalHandler to allow DI
    // if (isDefined(view.templateUrl)) {
    //     settings.templateUrl = view.templateUrl;
    // }

    // Deferred to be handled by ModalHandler to allow DI
    // if (isDefined(view.template)) {
    //     settings.template = <string> view.template;
    // }

    // TODO styleUrl

    return new ModalHandler(modal, view, settings);

}