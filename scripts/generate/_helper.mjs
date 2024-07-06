export function mergeObjects(obj1, obj2) {
  for (let key in obj1) {
    if (!obj1.hasOwnProperty(key)) {
      continue;
    }

    if (Array.isArray(obj1[key])) {
      if (!Array.isArray(obj2[key])) {
        obj2[key] = [];
      }
      obj2[key] = mergeArrays(obj1[key], obj2[key]);
    } else if (typeof obj1[key] === 'object' && obj1[key] !== null) {
      if (typeof obj2[key] !== 'object' || obj2[key] === null) {
        obj2[key] = {};
      }
      mergeObjects(obj1[key], obj2[key]);
    } else if (!(key in obj2)) {
      obj2[key] = obj1[key];
    }
  }
  return obj2;
}

export function mergeArrays(arr1, arr2) {
  arr1.forEach(item1 => {
    if (Array.isArray(item1)) {
      arr2.push(mergeArrays(item1, []));
    } else if (typeof item1 === 'object' && item1 !== null) {
      // let found = false;
      // for (let i = 0; i < arr2.length; i++) {
      //   if (typeof arr2[i] === 'object' && arr2[i] !== null && !Array.isArray(arr2[i])) {
      //     if (Object.keys(item1).every(key => arr2[i].hasOwnProperty(key))) {
      //       console.log('found' , item1)
      //       mergeObjects(item1, arr2[i]);
      //       found = true;
      //       break;
      //     }
      //   }
      // }
      // if (!found) {
        arr2.push(mergeObjects(item1, {}));
      // }
    } else if (!arr2.includes(item1)) {
      arr2.push(item1);
    }
  });
  return arr2;
}
