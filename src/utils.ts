export const isFunction = whatever =>
  whatever && typeof whatever === 'function' && Object.prototype.toString.call(whatever);
