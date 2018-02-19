
import noop from './noop';
import isArray from './isArray';
import nativeKeys from './nativeKeys';
import throwError from './throwError';
import once from './once';
import slice from './slice';
import arrayEachFunc from './arrayEachFunc';
import baseEachFunc from './baseEachFunc';

/**
 * @private
 * @param {Function} arrayEach
 * @param {Function} baseEach
 */
function createParallel(arrayEach, baseEach) {

  return function parallel(tasks, callback) {
    callback = callback || noop;
    var size, keys, result;
    var completed = 0;

    if (isArray(tasks)) {
      size = tasks.length;
      result = Array(size);
      arrayEach(tasks, createCallback);
    } else if (tasks && typeof tasks === obj) {
      keys = nativeKeys(tasks);
      size = keys.length;
      result = {};
      baseEach(tasks, createCallback, keys);
    }
    if (!size) {
      callback(null, result);
    }

    function createCallback(key) {
      return function(err, res) {
        if (key === null) {
          throwError();
        }
        if (err) {
          key = null;
          callback = once(callback);
          callback(err, result);
          return;
        }
        result[key] = arguments.length <= 2 ? res : slice(arguments, 1);
        key = null;
        if (++completed === size) {
          callback(null, result);
        }
      };
    }
  };
}


/**
 * @memberof async
 * @namespace parallel
 * @param {Array|Object} tasks - functions
 * @param {Function} callback
 * @example
 *
 * var order = [];
 * var tasks = [
 *  function(done) {
   *    setTimeout(function() {
   *      order.push(1);
   *      done(null, 1);
   *    }, 10);
   *  },
 *  function(done) {
   *    setTimeout(function() {
   *      order.push(2);
   *      done(null, 2);
   *    }, 30);
   *  },
 *  function(done) {
   *    setTimeout(function() {
   *      order.push(3);
   *      done(null, 3);
   *    }, 40);
   *  },
 *  function(done) {
   *    setTimeout(function() {
   *      order.push(4);
   *      done(null, 4);
   *    }, 20);
   *  }
 * ];
 * async.parallel(tasks, function(err, res) {
   *   console.log(res); // [1, 2, 3, 4];
   *   console.log(order); // [1, 4, 2, 3]
   * });
 *
 * @example
 *
 * var order = [];
 * var tasks = {
   *   'a': function(done) {
   *     setTimeout(function() {
   *       order.push(1);
   *       done(null, 1);
   *     }, 10);
   *   },
   *   'b': function(done) {
   *     setTimeout(function() {
   *       order.push(2);
   *       done(null, 2);
   *     }, 30);
   *   },
   *   'c': function(done) {
   *     setTimeout(function() {
   *       order.push(3);
   *       done(null, 3);
   *     }, 40);
   *   },
   *   'd': function(done) {
   *     setTimeout(function() {
   *       order.push(4);
   *       done(null, 4);
   *     }, 20);
   *   }
   * };
 * async.parallel(tasks, function(err, res) {
   *   console.log(res); // { a: 1, b: 2, c: 3, d:4 }
   *   console.log(order); // [1, 4, 2, 3]
   * });
 *
 */
var parallel = createParallel(arrayEachFunc, baseEachFunc);

export default parallel;