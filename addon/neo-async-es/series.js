

import noop from './noop';
import isArray from './isArray';
import nativeKeys from './nativeKeys';
import throwError from './throwError';



import obj from './obj';

import { nextTick } from "./ticks";
import onlyOnce from './onlyOnce';
import slice from './slice';

/**
 * @memberof async
 * @namespace series
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
 * async.series(tasks, function(err, res) {
   *   console.log(res); // [1, 2, 3, 4];
   *   console.log(order); // [1, 2, 3, 4]
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
 * async.series(tasks, function(err, res) {
   *   console.log(res); // { a: 1, b: 2, c: 3, d:4 }
   *   console.log(order); // [1, 4, 2, 3]
   * });
 *
 */
export default function series(tasks, callback) {
  callback = callback || noop;
  var size, key, keys, result, iterate;
  var sync = false;
  var completed = 0;

  if (isArray(tasks)) {
    size = tasks.length;
    result = Array(size);
    iterate = arrayIterator;
  } else if (tasks && typeof tasks === obj) {
    keys = nativeKeys(tasks);
    size = keys.length;
    result = {};
    iterate = objectIterator;
  } else {
    return callback(null);
  }
  if (!size) {
    return callback(null, result);
  }
  iterate();

  function arrayIterator() {
    key = completed;
    tasks[completed](done);
  }

  function objectIterator() {
    key = keys[completed];
    tasks[key](done);
  }

  function done(err, res) {
    if (err) {
      iterate = throwError;
      callback = onlyOnce(callback);
      callback(err, result);
      return;
    }
    result[key] = arguments.length <= 2 ? res : slice(arguments, 1);
    if (++completed === size) {
      iterate = throwError;
      callback(null, result);
    } else if (sync) {
      nextTick(iterate);
    } else {
      sync = true;
      iterate();
    }
    sync = false;
  }
}
