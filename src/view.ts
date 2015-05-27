/// <reference path="./_references" />

import {makeDecorator} from './utils';

/**
 * Options available when decorating a class as a ViewModel
 * TODO document
 */
export interface ViewOptions {
}

/**
 * @internal
 */
export class ViewAnnotation {

}

type ViewDecorator = () => ClassDecorator;

/**
 * A decorator to annotate a class with view information
 */
export var View = <ViewDecorator> makeDecorator(ViewAnnotation);