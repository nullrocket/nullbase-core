import throwError from './throwError';

/**
 * @private
 * @param {Function} func
 */
export default function onlyOnce(func) {
  return function(err, res) {
    var fn = func;
    func = throwError;
    fn(err, res);
  };
}