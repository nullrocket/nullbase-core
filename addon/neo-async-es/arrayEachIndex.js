/**
 * @private
 */
export default function arrayEachIndex(array, iterator, createCallback) {
  var index = -1;
  var size = array.length;

  if (iterator.length === 3) {
    while (++index < size) {
      iterator(array[index], index, createCallback(index));
    }
  } else {
    while (++index < size) {
      iterator(array[index], createCallback(index));
    }
  }
}