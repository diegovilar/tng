/// <reference path="../../_references.ts" />

import {Inject} from '../../di'
import {Decorator} from '../../decorator'
import {getModalHandler} from './modal'

import IModalService = ng.ui.bootstrap.IModalService
import IModalSettings = ng.ui.bootstrap.IModalSettings
import IModalServiceInstance = ng.ui.bootstrap.IModalServiceInstance
import IInjectorService = ng.auto.IInjectorService



@Decorator({
	name: '$modal'
})
export class ModalServiceDecorator implements Decorator {

	decorate(
		@Inject('$delegate') $modal: IModalService,
		@Inject('$injector') $injector: ng.auto.IInjectorService): IModalService {

		var originalOpen = $modal.open;
		$modal.open = function(optionsOrModal: any, scope?: ng.IScope): IModalServiceInstance {

			// Usign @Modal decorator?
			if (typeof optionsOrModal === 'function') {
				var handler = getModalHandler(<Function> optionsOrModal, scope);
				return $injector.invoke(handler.open, handler);
			}
			// Using the original IModalSettings object
			else {
				return originalOpen.call($modal, optionsOrModal);
			}

		}

		return $modal;

	}

}