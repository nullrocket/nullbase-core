/*
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

/**
 * This module contains the handlers for native platform events.
 * From here, the dispatcher is called to create unified pointer events.
 * Included are touch events (v1), mouse events, and MSPointerEvents.
 */



import dispatcher from './dispatcher';
import pointerEvents from './pointer';
import msEvents from './ms';
import mouseEvents from './mouse';
import touchEvents from './touch';


var nav = window.navigator;

if ( window.PointerEvent ) {

  dispatcher.registerSource('pointer', pointerEvents);
}
else if ( nav.msPointerEnabled ) {
  dispatcher.registerSource('ms', msEvents);
}
else {

  dispatcher.registerSource('mouse', mouseEvents);
  if ( window.ontouchstart !== undefined ) {

    dispatcher.registerSource('touch', touchEvents);
  }
}

// Work around iOS bugs https://bugs.webkit.org/show_bug.cgi?id=135628 and https://bugs.webkit.org/show_bug.cgi?id=136506
var ua = navigator.userAgent;
var IS_IOS = ua.match(/iPad|iPhone|iPod/) && 'ontouchstart' in window;

dispatcher.IS_IOS = IS_IOS;
touchEvents.IS_IOS = IS_IOS;

dispatcher.register(document, true);

