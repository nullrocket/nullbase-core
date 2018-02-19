/**
 * @private
 * @param {number} n
 * @param {Function} iterator
 */
export default function timesSync(n, iterator) {
  var index = -1;
  while (++index < n) {
    iterator(index);
  }
}