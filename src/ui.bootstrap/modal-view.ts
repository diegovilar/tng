import {$$reflection, $$utils, ViewAnnotation, ViewOptions} from "angularts.core";

let makeDecorator = $$reflection.makeDecorator;
let setIfInterface = $$utils.setIfInterface;


export enum ModalBackdrop {
	Show,
	Hide,
	Static
}

/**
 * @internal
 */
export const MODAL_BACKDROP_MAP = [true, false, 'static'];

/**
 * Options available when decorating a modal with view information
 * TODO document
 */
export interface ModalViewOptions extends ViewOptions {

    animation?: boolean;
	backdrop?: ModalBackdrop;
	backdropClass?: string;
	keyboard?: boolean;
	windowClass?: string;
	windowTemplateUrl?: string;
	size?: string;

}

/**
 * @internal
 */
export class ModalViewAnnotation extends ViewAnnotation {

    animation: boolean = void 0;
	backdrop: ModalBackdrop = void 0;
	backdropClass: string = void 0;
	keyboard: boolean = void 0;
	windowClass: string = void 0;
	windowTemplateUrl: string = void 0;
	size: string = void 0;

    constructor(options: ModalViewOptions) {
		super(options);
		setIfInterface(this, options);
    }

}

type ModalViewDecorator = (options: ModalViewOptions) => ClassDecorator;

/**
 * A decorator to annotate a modal with view information
 */
export var ModalView = <ModalViewDecorator> makeDecorator(ModalViewAnnotation);