export function equivalent(a, b) {
  if (a === b) {
    return true;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.every((aItem, index) => (aItem === b[index]));
  }
  if (typeof a === 'function' && typeof b === 'function') {
    return a.toString() === b.toString();
  }
  if (a instanceof Set && b instanceof Set) {
    if (a.size !== a.size) {
      return false;
    }
    for (let i of a) {
      if (!b.has(i)) {
        return false;
      }
    }
    return true;
  }
  return false;
}
