/// <reference path="../_references.ts" />

// TODO debug only?
import {assert} from '../assert'

import {Inject, bind} from '../di'
import {makeDecorator, create, isDefined, isString, isFunction, Map, isArray, forEach, setIfInterface} from '../utils'
import {hasAnnotation, getAnnotations, mergeAnnotations} from '../reflection'
import {ModalViewAnnotation, MODAL_BACKDROP_MAP} from './modal-view'

import IModalServiceInstance = ng.ui.bootstrap.IModalServiceInstance
import IModalService = ng.ui.bootstrap.IModalService
import IModalSettings = ng.ui.bootstrap.IModalSettings
import IModalStackService = ng.ui.bootstrap.IModalStackService

export {ModalView, ModalBackdrop} from './modal-view'



export interface ModalOptions {

    scope?: ng.IScope|{(): ng.IScope};
    bindToController?: boolean;
    keyboard?: boolean;
    dismissAll?: boolean;
    resolve?: {[key: string]: string|Function};

}

export class ModalAnnotation {

    scope: ng.IScope = void 0;
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

    constructor(private modalNotes: ModalAnnotation, private settings: IModalSettings){

    }

    open(@Inject('$modal') $modal: IModalService,
         @Inject('$modalStack') $modalStack: IModalStackService): IModalServiceInstance {

        if (this.modalNotes.dismissAll) {
            $modalStack.dismissAll();
        }

        this.instance = $modal.open(this.settings);
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

    if (isDefined(modal.scope)) {
        settings.scope = modal.scope;
    }

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

    if (isDefined(view.templateUrl)) {
        settings.templateUrl = view.templateUrl;
    }

    if (isDefined(view.template)) {
        // TODO Accepts {() => string}, from ViewOptions, but the modal does not support it
        settings.template = <string> view.template;
    }

    // TODO styleUrl

    return new ModalHandler(modal, settings);

}