/**
 * Converts `arguments` to an array.
 *
 * @private
 * @param {Array} array = The array to slice.
 */
export default function createArray(array) {
  var index = -1;
  var size = array.length;
  var result = Array(size);

  while (++index < size) {
    result[index] = array[index];
  }
  return result;
}