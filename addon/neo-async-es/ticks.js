
import slice from './slice';
import func from './func';
import obj from './obj';
export var nextTick ;
export var asyncNextTick;
export var asyncSetImmediate;



/**
 * @private
 */
function createImmediate(safeMode) {
  var delay = function delay(fn) {
    var args = slice(arguments, 1);
    setTimeout(function() {
      fn.apply(null, args);
    });
  };
  asyncSetImmediate = typeof setImmediate === func ? setImmediate : delay;
  if (typeof process === obj && typeof process.nextTick === func) {
    nextTick = /^v0.10/.test(process.version) ? asyncSetImmediate : process.nextTick;
    asyncNextTick = /^v0/.test(process.version) ? asyncSetImmediate : process.nextTick;
  } else {
    asyncNextTick = nextTick = asyncSetImmediate;
  }
  if (safeMode === false) {
    nextTick = function(cb) {
      cb();
    };
  }
}







createImmediate();

