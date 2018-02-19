
export default function AnimationFrameQueue() {
  this.queue = [];
  this.supported = "requestAnimationFrame" in window;
}

AnimationFrameQueue.prototype.add = function ( callback ) {
  if ( !this.supported ) return callback();

  this.queue.push(
    window.requestAnimationFrame(function () {
      this.queue.shift();
      callback();
    }.bind(this))
  );
};

AnimationFrameQueue.prototype.clear = function () {

  for ( let i = 0, len = this.queue.length; i < len; i++ ) {
    window.cancelAnimationFrame(this.queue[ i ]);

  }
  this.queue.length = 0;
};