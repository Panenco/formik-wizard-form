export const isFunction = (whatever: any): whatever is Function =>
  whatever && typeof whatever === 'function' && Object.prototype.toString.call(whatever);
