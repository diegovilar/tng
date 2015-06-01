/// <reference path="../_references" />

import {Constant} from 'tng/constant';

export var constant = 1; 
export var constantName = 'TestConstant';

export var wrappedConstant = Constant(constantName, constant);