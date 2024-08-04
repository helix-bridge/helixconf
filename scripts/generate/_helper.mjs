export function mergeObjects(from, to) {
  for (let key in from) {
    if (!from.hasOwnProperty(key)) {
      continue;
    }

    if (Array.isArray(from[key])) {
      if (!Array.isArray(to[key])) {
        to[key] = [];
      }
      to[key] = mergeArrays(to[key], from[key]);
    } else if (typeof from[key] === 'object' && from[key] !== null) {
      if (typeof to[key] !== 'object' || to[key] === null) {
        to[key] = {};
      }
      mergeObjects(from[key], to[key]);
    } else if (!(key in to)) {
      to[key] = from[key];
    }
  }
  return to;
}

export function mergeArrays(from, to) {
  from.forEach(ltm => {
    if (Array.isArray(ltm)) {
      to.push(mergeArrays(ltm, []));
    } else if (typeof ltm === 'object' && ltm !== null) {
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

      // arr2.push(mergeObjects(item1, {}));

      to.push({
        ...mergeObjects(ltm, {}),
        '_customize': true,
      });

      // }
    } else if (!to.includes(ltm)) {
      to.push(ltm);
    }
  });
  return to;
}

export function filterArray(array, condition, mark = '_customize') {
  return array.reduce((acc, current) => {
    const existing = acc.find(item => condition ? condition(item, current) : false);
    if (existing) {
      if (current[mark]) {
        const index = acc.indexOf(existing);
        acc[index] = current;
      }
    } else {
      acc.push(current);
    }
    return acc;
  }, [])
}
