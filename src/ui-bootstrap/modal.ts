/// <reference path="../_references.ts" />

// TODO debug only?
import {assert} from '../assert'
import {Inject, bind, hasInjectAnnotation} from '../di'
import {makeDecorator, create, isDefined, isString, isFunction, Map, isArray, forEach, setIfInterface} from '../utils'
import {hasAnnotation, getAnnotations, mergeAnnotations} from '../reflection'
import {ModalViewAnnotation, MODAL_BACKDROP_MAP} from './modal-view'
export {ModalView, ModalBackdrop} from './modal-view'

import IModalServiceInstance = ng.ui.bootstrap.IModalServiceInstance
import IModalService = ng.ui.bootstrap.IModalService
import IModalSettings = ng.ui.bootstrap.IModalSettings
import IModalStackService = ng.ui.bootstrap.IModalStackService
import IModalScope = ng.ui.bootstrap.IModalScope



export interface ModalOptions {

    scope?: ng.IScope|IModalScope|{(...args: any[]): ng.IScope|IModalScope};
    bindToController?: boolean;
    keyboard?: boolean;
    dismissAll?: boolean;
    resolve?: {[key: string]: string|Function};

}

/**
 * @internal
 */
export class ModalAnnotation {

    scope: ng.IScope|IModalScope|{(...args: any[]): ng.IScope|IModalScope} = void 0;
    bindToController = true;
    keyboard = true;
    dismissAll = true;
    resolve: Map<string|Function> = null;

    constructor(options: ModalOptions) {

        setIfInterface(this, options);

    }

}

type ModalDecorator = (options: ModalOptions) => ClassDecorator;

/**
 * A decorator to annotate a class as being a modal controller
 */
export var Modal = <ModalDecorator> makeDecorator(ModalAnnotation);

export class ModalHandler {

    private instance: IModalServiceInstance = null;

    constructor(
        private modalNotes: ModalAnnotation,
        private viewNotes: ModalViewAnnotation,
        private settings: IModalSettings){
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


export function getModalHandler(modalClass: Function): ModalHandler {

    var modalNotes = getAnnotations(modalClass, ModalAnnotation);
    var viewNotes = getAnnotations(modalClass, ModalViewAnnotation);

    // TODO debug only?
    assert(modalNotes, 'Missing @Modal decoration');
    assert(viewNotes, 'Missing @ModalView decoration');

    var settings: ng.ui.bootstrap.IModalSettings = {
        controller: modalClass
    };

    var modal = <ModalAnnotation> {/*no defaults*/};
    mergeAnnotations(modal, ...modalNotes);

    // Deferred to be handled by ModalHandler to allow DI
    // if (isDefined(modal.scope)) {
    //     settings.scope = modal.scope;
    // }

    if (isDefined(modal.bindToController)) {
        settings.bindToController = modal.bindToController;
    }

    // TODO resolve

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