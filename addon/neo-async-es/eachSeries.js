
import noop from './noop';
import isArray from './isArray';
import nativeKeys from './nativeKeys';
import throwError from './throwError';

import iteratorSymbol from './iteratorSymbol';

import obj from './obj';

import { nextTick } from "./ticks";
import onlyOnce from './onlyOnce';
/**
 * @memberof async
 * @namespace eachSeries
 * @param {Array|Object} collection
 * @param {Function} iterator
 * @param {Function} callback
 * @example
 *
 * // array
 * var order = [];
 * var array = [1, 3, 2];
 * var iterator = function(num, done) {
   *   setTimeout(function() {
   *     order.push(num);
   *     done();
   *   }, num * 10);
   * };
 * async.eachSeries(array, iterator, function(err, res) {
   *   console.log(res); // undefined
   *   console.log(order); // [1, 3, 2]
   * });
 *
 * @example
 *
 * // array with index
 * var order = [];
 * var array = [1, 3, 2];
 * var iterator = function(num, index, done) {
   *   setTimeout(function() {
   *     order.push([num, index]);
   *     done();
   *   }, num * 10);
   * };
 * async.eachSeries(array, iterator, function(err, res) {
   *   console.log(res); // undefined
   *   console.log(order); // [[1, 0], [3, 1], [2, 2]]
   * });
 *
 * @example
 *
 * // object
 * var order = [];
 * var object = { a: 1, b: 3, c: 2 };
 * var iterator = function(num, done) {
   *   setTimeout(function() {
   *     order.push(num);
   *     done();
   *   }, num * 10);
   * };
 * async.eachSeries(object, iterator, function(err, res) {
   *   console.log(res); // undefined
   *   console.log(order); // [1, 3, 2]
   * });
 *
 * @example
 *
 * // object with key
 * var order = [];
 * var object = { a: 1, b: 3, c: 2 };
 * var iterator = function(num, key, done) {
   *   setTimeout(function() {
   *     order.push([num, key]);
   *     done();
   *   }, num * 10);
   * };
 * async.eachSeries(object, iterator, function(err, res) {
   *   console.log(res); // undefined
   *   console.log(order); // [[1, 'a'], [3, 'b'], [2, 'b']]
   * });
 *
 * @example
 *
 * // break
 * var order = [];
 * var array = [1, 3, 2];
 * var iterator = function(num, done) {
   *   setTimeout(function() {
   *     order.push(num);
   *     done(null, num !== 3);
   *   }, num * 10);
   * };
 * async.eachSeries(array, iterator, function(err, res) {
   *   console.log(res); // undefined
   *   console.log(order); // [1, 3]
   * });
 */
export default function eachSeries(collection, iterator, callback) {
  callback = onlyOnce(callback || noop);
  var size, key, keys, iter, value, iterate;
  var sync = false;
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
  if (!size) {
    return callback(null);
  }
  iterate();

  function arrayIterator() {
    iterator(collection[completed], done);
  }

  function arrayIteratorWithIndex() {
    iterator(collection[completed], completed, done);
  }

  function symbolIterator() {
    iterator(iter.next().value, done);
  }

  function symbolIteratorWithKey() {
    value = iter.next().value;
    iterator(value, completed, done);
  }

  function objectIterator() {
    iterator(collection[keys[completed]], done);
  }

  function objectIteratorWithKey() {
    key = keys[completed];
    iterator(collection[key], key, done);
  }

  function done(err, bool) {
    if (err) {
      callback(err);
    } else if (++completed === size) {
      iterate = throwError;
      callback(null);
    } else if (bool === false) {
      iterate = throwError;
      callback(null);
    } else if (sync) {
      nextTick(iterate);
    } else {
      sync = true;
      iterate();
    }
    sync = false;
  }
}
