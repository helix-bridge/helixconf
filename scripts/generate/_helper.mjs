export function mergeObjects(source, target) {
  for (let key in source) {
    if (!source.hasOwnProperty(key)) {
      continue;
    }
    if (Array.isArray(source[key])) {
      if (!Array.isArray(target[key])) {
        target[key] = [];
      }
      target[key] = mergeArrays(source[key], target[key]);
    } else if (typeof source[key] === 'object' && source[key] !== null) {
      if (typeof target[key] !== 'object' || target[key] === null) {
        target[key] = {};
      }
      mergeObjects(source[key], target[key]);
    } else if (!(key in target)) {
      target[key] = source[key];
    }
  }
  return target;
}

export function mergeArrays(sources, targets) {
  sources.forEach(st => {
    if (!st) return;
    if (Array.isArray(st)) {
      targets.push(mergeArrays(st, []));
      return;
    }
    if (typeof st === 'object') {
      targets.push(mergeObjects(st, {_base: true}));
      return;
    }
    if (!targets.includes(st)) {
      targets.push(st);
    }
  });
  return targets;
}

export function filterArray(array, condition, mark = '_base') {
  return array.reduce((acc, current) => {
    const existing = acc.find(item => condition ? condition(item, current) : false);
    if (existing) {
      if (!current[mark]) {
        const index = acc.indexOf(existing);
        acc[index] = current;
      }
    } else {
      acc.push(current);
    }
    return acc;
  }, [])
}
