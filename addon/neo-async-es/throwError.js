var throwError = function throwError() {
  throw new Error('Callback was already called.');
};

export default throwError;