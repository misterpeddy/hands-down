// Source: https://redd.one/blog/debounce-vs-throttle
const debounce = (func, duration) => {
  let timeout;
  return function launch(...args) {
    const effect = () => {
      timeout = null;
      return func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(effect, duration);
  };
};

const throttle = (func, duration) => {
  let shouldWait = false;
  return function launch(...args) {
    if (!shouldWait) {
      func.apply(this, args);
      shouldWait = true;
      setTimeout(() => {
        shouldWait = false;
      }, duration);
    }
  };
};

export { debounce, throttle };
