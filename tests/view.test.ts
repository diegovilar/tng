import * as assert from 'assert';
import {View} from './view';

@View({
    template: 'i\'m a template'
})
class Test {
    
}

assert(Reflect.hasMetadata('annotations', Test));

//(<any>console).dir(Test);
//(<any>console).dir(Reflect.getMetadataKeys(Test));
//(<any>console).dir(Reflect.getMetadata('annotations', Test));
