function sanitize(obj) {
  if (obj === undefined) return null;
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(sanitize);
  const result = {};
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined) {
      result[key] = sanitize(obj[key]);
    }
  }
  return result;
}
console.log(sanitize({ a: 1, b: undefined, c: [1, undefined, 3] }));
