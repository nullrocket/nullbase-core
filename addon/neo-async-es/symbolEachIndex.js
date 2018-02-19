import iteratorSymbol from './iteratorSymbol';
/**
 * @private
 */
export default function symbolEachIndex(collection, iterator, createCallback) {
  var values;
  var index = -1;
  var size = collection.size;
  var iter = collection[iteratorSymbol]();

  if (iterator.length === 3) {
    while (++index < size) {
      values = iter.next().value;
      iterator(values, index, createCallback(index));
    }
  } else {
    while (++index < size) {
      iterator(iter.next().value, createCallback(index));
    }
  }
}