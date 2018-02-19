/**
 * @private
 */
export default function arrayEachFunc(array, createCallback) {
  var index = -1;
  var size = array.length;

  while (++index < size) {
    array[index](createCallback(index));
  }
}