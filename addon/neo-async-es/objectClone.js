import nativeKeys from './nativeKeys';
/**
 * @private
 * @param {Object} object
 */
export default function objectClone(object) {
  var keys = nativeKeys(object);
  var size = keys.length;
  var index = -1;
  var result = {};

  while (++index < size) {
    var key = keys[index];
    result[key] = object[key];
  }
  return result;
}