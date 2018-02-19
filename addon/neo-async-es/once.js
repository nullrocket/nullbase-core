import noop from './noop';

/**
 * @private
 * @param {Function} func
 */
export default function once(func) {
  return function(err, res) {
    var fn = func;
    func = noop;
    fn(err, res);
  };
}