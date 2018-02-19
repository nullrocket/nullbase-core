/**
 * Create an array from `start`
 *
 * @private
 * @param {Array} array - The array to slice.
 * @param {number} start - The start position.
 */
export default function slice(array, start) {
  var end = array.length;
  var index = -1;
  var size = end - start;
  if (size <= 0) {
    return [];
  }
  var result = Array(size);

  while (++index < size) {
    result[index] = array[index + start];
  }
  return result;
}