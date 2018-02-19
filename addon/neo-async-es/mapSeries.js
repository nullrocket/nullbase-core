
import noop from './noop';
import isArray from './isArray';
import iteratorSymbol from './iteratorSymbol';
import nativeKeys from './nativeKeys';
import obj from './obj';

import throwError from './throwError';
import onlyOnce from './onlyOnce';
import createArray from './createArray';
import {nextTick} from "./ticks";

/**
 * @memberof async
 * @namespace mapSeries
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
   *     done(null, num);
   *   }, num * 10);
   * };
 * async.mapSeries(array, iterator, function(err, res) {
   *   console.log(res); // [1, 3, 2];
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
   *     done(null, num);
   *   }, num * 10);
   * };
 * async.mapSeries(array, iterator, function(err, res) {
   *   console.log(res); // [1, 3, 2]
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
   *     done(null, num);
   *   }, num * 10);
   * };
 * async.mapSeries(object, iterator, function(err, res) {
   *   console.log(res); // [1, 3, 2]
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
   *     done(null, num);
   *   }, num * 10);
   * };
 * async.mapSeries(object, iterator, function(err, res) {
   *   console.log(res); // [1, 3, 2]
   *   console.log(order); // [[1, 'a'], [3, 'b'], [2, 'c']]
   * });
 *
 */
export default function mapSeries(collection, iterator, callback) {
  callback = callback || noop;
  var size, key, keys, iter, value, result, iterate;
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
    return callback(null, []);
  }
  result = Array(size);
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

  function done(err, res) {
    if (err) {
      iterate = throwError;
      callback = onlyOnce(callback);
      callback(err, createArray(result));
      return;
    }
    result[completed] = res;
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
  }
}