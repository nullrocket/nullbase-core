/**
 * @private
 */
export default function baseEachFunc(object, createCallback, keys) {
  var key;
  var index = -1;
  var size = keys.length;

  while (++index < size) {
    key = keys[index];
    object[key](createCallback(key));
  }
}
