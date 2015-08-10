/// <reference path="../_references.ts" />


// TODO debug only?
import {assert} from '../assert'

import {Inject, bind} from '../di'
import {makeDecorator, create, isDefined, isString, isFunction, Map, isArray, forEach, setIfInterface} from '../utils'
import {hasAnnotation, getAnnotations, mergeAnnotations} from '../reflection'
import {ModalViewAnnotation, MODAL_BACKDROP_MAP} from './modal-view'



export interface ModalOptions {

    scope?: ng.IScope;
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

class ModalHandler {

    private $modalInstance: ng.ui.bootstrap.IModalSettings = null;

    constructor(@Inject('$modal') private $modal: ng.ui.bootstrap.IModalService ){

    }

    // open(): ng.ui.bootstrap.IModalServiceInstance {

    //     this.$modalInstance = this.$modal.open({});

    // }

}


export function getModalHandler(modalClass: Function): ModalHandler {

    var modalNotes = getAnnotations(modalClass, ModalAnnotation);
    var viewNotes = getAnnotations(modalClass, ModalViewAnnotation);

    // TODO debug only?
    assert(modalNotes, 'Missing @Modal decoration');
    assert(viewNotes, 'Missing @ModalView decoration');

    // var handler =

    // var modal = <ModalAnnotation> {/*no defaults*/};
    // mergeAnnotations(modal, ...modalNotes);

    // var view = <ModalViewAnnotation> {/*no defaults*/};
    // mergeAnnotations(view, ...viewNotes);

    // var settings: ng.ui.bootstrap.IModalSettings = {
    //     controller: modalClass
    // };

    // if (isDefined(modal.bindToController)) {
    //     settings.bindToController = modal.bindToController;
    // }

    // if (isDefined(modal.keyboard)) {
    //     settings.keyboard = modal.keyboard;
    // }

    // if (isDefined(modal.scope)) {
    //     settings.scope = modal.scope;
    // }

    // if (isDefined(modal.dismissAll)) {
    //     settings.scope = modal.scope;
    // }


    // return settings;
    return null

}