/**
 * @private
 */
export default function baseEachIndex(object, iterator, createCallback, keys) {
  var key;
  var index = -1;
  var size = keys.length;

  if (iterator.length === 3) {
    while (++index < size) {
      key = keys[index];
      iterator(object[key], key, createCallback(index));
    }
  } else {
    while (++index < size) {
      iterator(object[keys[index]], createCallback(index));
    }
  }
}