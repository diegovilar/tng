import 'reflect-metadata';

export function makeDecorator<T extends Function>(cls:T) {
  
    return function() {
  
        var args = arguments;
        var annotationInstance = Object.create(cls.prototype);
        cls.apply(annotationInstance, args);
    
        return function(target: T) {
    
            var annotations = Reflect.getMetadata('annotations', target);
            annotations = annotations || [];
            annotations.push(annotationInstance);
            Reflect.defineMetadata('annotations', annotations, target);
            return target;
            
        }
        
    }  
    
}

export function makeParamDecorator<T extends Function>(cls:T) {
    
    return function() {        
    
        var args = arguments;
        var annotationInstance = Object.create(cls.prototype);
        cls.apply(annotationInstance, args);
        
        return function(target:T, unusedKey:string, index:number) {
            
            var parameters = Reflect.getMetadata('parameters', target);
            parameters = parameters || [];
    
            // there might be gaps if some in between parameters do not have annotations.
            // we pad with nulls.
            while (parameters.length <= index) {
                parameters.push(null);
            }
            
            parameters[index] = annotationInstance;
            Reflect.defineMetadata('parameters', parameters, target);
            return target;
            
        }
        
    }
    
}