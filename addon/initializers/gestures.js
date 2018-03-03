
import Ember from 'ember';

import {
  default as dispatcher,
  addEventListener as _add,
  removeEventListener as _remove
} from './gestures/dispatcher';
import platformEvents from './gestures/platform-events';
import tap from './gestures/tap';
import track from './gestures/track';
import hold from './gestures/hold';
import pinch from './gestures/pinch';
dispatcher.registerGesture('pinch', pinch);
dispatcher.registerGesture('track', track);
dispatcher.registerGesture('tap', tap);
dispatcher.registerGesture('hold', hold);
Ember.EventDispatcher.reopen({
  setup: function () {
    let events = this.get('events');
    let ignoreEvents = [ 'touchmove', 'touchstart', 'touchend', 'touchcancel', 'mouseenter', 'mouseleave', 'focusin', 'focusout' ];
    for (var i=0, len= ignoreEvents.length;i <= len;i++)
    {
      events[ ignoreEvents[i] ] = null;
      delete events[ignoreEvents[i]];
    }
    this.set('events', events);
    return this._super(...arguments);
  }
});


/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */





export function initialize( application ) {
  application.register('service:gestures', {addEventListener:_add,removeEventListener:_remove}, { instantiate: false });

}

export default {
  name: 'gestures',
  initialize
};