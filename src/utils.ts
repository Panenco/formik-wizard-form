export const isFunction = (whatever: Function) =>
  whatever && typeof whatever === 'function' && Object.prototype.toString.call(whatever);
