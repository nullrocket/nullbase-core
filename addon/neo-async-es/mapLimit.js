
import noop from './noop';
import isArray from './isArray';
import iteratorSymbol from './iteratorSymbol';
import nativeKeys from './nativeKeys';
import obj from './obj';
import timesSync from './timesSync';
import throwError from './throwError';
import once from './once';
import createArray from './createArray';
import { nextTick } from "./ticks";

/**
 * @memberof async
 * @namespace mapLimit
 * @param {Array|Object} collection
 * @param {number} limit - limit >= 1
 * @param {Function} iterator
 * @param {Function} callback
 * @example
 *
 * // array
 * var order = [];
 * var array = [1, 5, 3, 4, 2];
 * var iterator = function(num, done) {
   *   setTimeout(function() {
   *     order.push(num);
   *     done(null, num);
   *   }, num * 10);
   * };
 * async.mapLimit(array, 2, iterator, function(err, res) {
   *   console.log(res); // [1, 5, 3, 4, 2]
   *   console.log(order); // [1, 3, 5, 2, 4]
   * });
 *
 * @example
 *
 * // array with index
 * var order = [];
 * var array = [1, 5, 3, 4, 2];
 * var iterator = function(num, index, done) {
   *   setTimeout(function() {
   *     order.push([num, index]);
   *     done(null, num);
   *   }, num * 10);
   * };
 * async.mapLimit(array, 2, iterator, function(err, res) {
   *   console.log(res); // [1, 5, 3, 4, 2]
   *   console.log(order); // [[1, 0], [3, 2], [5, 1], [2, 4], [4, 3]]
   * });
 *
 * @example
 *
 * // object
 * var order = [];
 * var object = { a: 1, b: 5, c: 3, d: 4, e: 2 };
 * var iterator = function(num, done) {
   *   setTimeout(function() {
   *     order.push(num);
   *     done(null, num);
   *   }, num * 10);
   * };
 * async.mapLimit(object, 2, iterator, function(err, res) {
   *   console.log(res); // [1, 5, 3, 4, 2]
   *   console.log(order); // [1, 3, 5, 2, 4]
   * });
 *
 * @example
 *
 * // object with key
 * var order = [];
 * var object = { a: 1, b: 5, c: 3, d: 4, e: 2 };
 * var iterator = function(num, key, done) {
   *   setTimeout(function() {
   *     order.push([num, key]);
   *     done(null, num);
   *   }, num * 10);
   * };
 * async.mapLimit(object, 2, iterator, function(err, res) {
   *   console.log(res); // [1, 5, 3, 4, 2]
   *   console.log(order); // [[1, 'a'], [3, 'c'], [5, 'b'], [2, 'e'], [4, 'd']]
   * });
 *
 */
export default function mapLimit(collection, limit, iterator, callback) {
  callback = callback || noop;
  var size, index, key, keys, iter, item, result, iterate;
  var sync = false;
  var started = 0;
  var completed = 0;

  if (isArray(collection)) {
    size = collection.length;
    iterate = iterator.length === 3 ? arrayIteratorWithIndex : arrayIterator;
  } else if (!collection) {
  } else if (iteratorSymbol && collection[iteratorSymbol]) {
    size = collection.size;
    iter = collection[iteratorSymbol]();
    iterate = iterator.length === 3 ? symbolIteratorWithKey : symbolIterator;
  } else if (typeof collection === obj) {
    keys = nativeKeys(collection);
    size = keys.length;
    iterate = iterator.length === 3 ? objectIteratorWithKey : objectIterator;
  }
  if (!size || isNaN(limit) || limit < 1) {
    return callback(null, []);
  }
  result = Array(size);
  timesSync(limit > size ? size : limit, iterate);

  function arrayIterator() {
    index = started++;
    if (index < size) {
      iterator(collection[index], createCallback(index));
    }
  }

  function arrayIteratorWithIndex() {
    index = started++;
    if (index < size) {
      iterator(collection[index], index, createCallback(index));
    }
  }

  function symbolIterator() {
    if ((item = iter.next()).done === false) {
      iterator(item.value, createCallback(started++));
    }
  }

  function symbolIteratorWithKey() {
    if ((item = iter.next()).done === false) {
      iterator(item.value, started, createCallback(started++));
    }
  }

  function objectIterator() {
    index = started++;
    if (index < size) {
      iterator(collection[keys[index]], createCallback(index));
    }
  }

  function objectIteratorWithKey() {
    index = started++;
    if (index < size) {
      key = keys[index];
      iterator(collection[key], key, createCallback(index));
    }
  }

  function createCallback(index) {
    return function(err, res) {
      if (index === null) {
        throwError();
      }
      if (err) {
        index = null;
        iterate = noop;
        callback = once(callback);
        callback(err, createArray(result));
        return;
      }
      result[index] = res;
      index = null;
      if (++completed === size) {
        iterate = throwError;
        callback(null, result);
        callback = throwError;
      } else if (sync) {
        nextTick(iterate);
      } else {
        sync = true;
        iterate();
      }
      sync = false;
    };
  }
}