export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  export function isEqual(obj1, obj2) {
    const obj1Keys = Object.keys(obj1);
    const obj2Keys = Object.keys(obj2);
  
    if (obj1Keys.length !== obj2Keys.length) {
      return false;
    }
  
    for (let key of obj1Keys) {
      const val1 = obj1[key];
      const val2 = obj2[key];
      const areObjects = isObject(val1) && isObject(val2);
      if (
        (areObjects && !isEqual(val1, val2)) ||
        (!areObjects && val1 !== val2)
      ) {
        return false;
      }
    }
  
    return true;
  }
  
  export function isObject(object) {
    return object != null && typeof object === 'object';
  }
  