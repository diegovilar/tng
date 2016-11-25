import {isArray, isString} from './utils';

var slice = Array.prototype.slice;

export interface AssertFunction extends Function {
	(test: any): void;
	(test: any, errorMessage: string): void;
	(test: any, error: Error): void;
}

export interface NotNullFunction extends Function {
	(value: any): void;
	(value: any, errorMessage: string): void;
	(value: any, error: Error): void;
}

export interface NotEmptyFunction extends Function {
	(value: string|Array<any>): void;
	(value: string|Array<any>, errorMessage: string): void;
	(value: string|Array<any>, error: Error): void;
}

export interface assert extends AssertFunction {
	notNull: NotNullFunction;
	notEmpty: NotEmptyFunction;
}

export function AssertionError(message?: string) {
    // Error.apply(this, arguments);
    this.name = 'AssertionError';
    this.message = message != null ? message : '';
}
(function() {
    function __() { this.constructor = AssertionError; }
    __.prototype = Error.prototype;
    AssertionError.prototype = new (<any>__)();
})();

function _assert(condition: boolean, errorOrMessage?: any): void {
    if (!condition) {
        throw (errorOrMessage instanceof Error) ? errorOrMessage :
            new (<any>AssertionError)(errorOrMessage || 'Assertion failed');
    }
}

function _notNull(value: any, errorOrMessage?: any) {
	_assert(value != null, errorOrMessage);
}

function _notEmpty(value: any, errorOrMessage?: any) {
    _notNull(value, errorOrMessage);

    if (isString(value)) {
        _assert(value.trim().length > 0, errorOrMessage);
    }
    else {
        _assert(value.length > 0, errorOrMessage);
    }
}

(<assert> _assert).notNull = _notNull;
(<assert> _assert).notEmpty = _notEmpty;

export var assert = <assert> _assert;