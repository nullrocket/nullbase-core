

import noop from './noop';
import isArray from './isArray';
import nativeKeys from './nativeKeys';
import throwError from './throwError';
import once from './once';
import iteratorSymbol from './iteratorSymbol';
import obj from './obj';
import createArray from './createArray';
import objectClone from './objectClone';
import arrayEachIndex from './arrayEachIndex';
import baseEachIndex from './baseEachIndex';
import symbolEachIndex from './symbolEachIndex';


/**
 * @private
 * @param {Function} arrayEach
 * @param {Function} baseEach
 * @param {Function} symbolEach
 */
function createMap(arrayEach, baseEach, symbolEach, useArray) {

  var init, clone;
  if (useArray) {
    init = Array;
    clone = createArray;
  } else {
    init = function() {
      return {};
    };
    clone = objectClone;
  }

  return function(collection, iterator, callback) {
    callback = callback || noop;
    var size, keys, result;
    var completed = 0;

    if (isArray(collection)) {
      size = collection.length;
      result = init(size);
      arrayEach(collection, iterator, createCallback);
    } else if (!collection) {
    } else if (iteratorSymbol && collection[iteratorSymbol]) {
      size = collection.size;
      result = init(size);
      symbolEach(collection, iterator, createCallback);
    } else if (typeof collection === obj) {
      keys = nativeKeys(collection);
      size = keys.length;
      result = init(size);
      baseEach(collection, iterator, createCallback, keys);
    }
    if (!size) {
      callback(null, init());
    }

    function createCallback(key) {
      return function done(err, res) {
        if (key === null) {
          throwError();
        }
        if (err) {
          key = null;
          callback = once(callback);
          callback(err, clone(result));
          return;
        }
        result[key] = res;
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
 * @namespace map
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
 * async.map(array, iterator, function(err, res) {
   *   console.log(res); // [1, 3, 2];
   *   console.log(order); // [1, 2, 3]
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
 * async.map(array, iterator, function(err, res) {
   *   console.log(res); // [1, 3, 2]
   *   console.log(order); // [[1, 0], [2, 2], [3, 1]]
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
 * async.map(object, iterator, function(err, res) {
   *   console.log(res); // [1, 3, 2]
   *   console.log(order); // [1, 2, 3]
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
 * async.map(object, iterator, function(err, res) {
   *   console.log(res); // [1, 3, 2]
   *   console.log(order); // [[1, 'a'], [2, 'c'], [3, 'b']]
   * });
 *
 */
var map = createMap(arrayEachIndex, baseEachIndex, symbolEachIndex, true);

export default map;