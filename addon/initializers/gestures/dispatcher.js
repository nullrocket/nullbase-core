/*
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */


import eventFactory from './eventFactory';
import PointerMap from './pointermap';
import { targetFinding } from './targetfind';
let CLONE_PROPS = [
  // MouseEvent
  'bubbles',
  'cancelable',
  'view',
  'detail',
  'screenX',
  'screenY',
  'clientX',
  'clientY',
  'ctrlKey',
  'altKey',
  'shiftKey',
  'metaKey',
  'button',
  'relatedTarget',
  // DOM Level 3
  'buttons',
  // PointerEvent
  'pointerId',
  'width',
  'height',
  'pressure',
  'tiltX',
  'tiltY',
  'pointerType',
  'hwTimestamp',
  'isPrimary',
  // event instance
  'type',
  'target',
  'currentTarget',
  'which',
  'pageX',
  'pageY',
  'timeStamp',
  // gesture addons
  'preventTap',
  'tapPrevented',
  '_source'
];


let CLONE_DEFAULTS = [
  // MouseEvent
  false,
  false,
  null,
  null,
  0,
  0,
  0,
  0,
  false,
  false,
  false,
  false,
  0,
  null,
  // DOM Level 3
  0,
  // PointerEvent
  0,
  0,
  0,
  0,
  0,
  0,
  '',
  0,
  false,
  // event instance
  '',
  null,
  null,
  0,
  0,
  0,
  0,
  function(){},
  false
];




let HAS_SVG_INSTANCE = (typeof SVGElementInstance !== 'undefined');

//let eventFactory = window.__PolymerGestures__.eventFactory;

// set of recognizers to run for the currently handled event
let currentGestures;

/**
 * This module is for normalizing events. Mouse and Touch events will be
 * collected here, and fire PointerEvents that have the same semantics, no
 * matter the source.
 * Events fired:
 *   - pointerdown: a pointing is added
 *   - pointerup: a pointer is removed
 *   - pointermove: a pointer is moved
 *   - pointerover: a pointer crosses into an element
 *   - pointerout: a pointer leaves an element
 *   - pointercancel: a pointer will no longer generate events
 */
 let dispatcher = {
  IS_IOS: false,
  pointermap: new PointerMap(),
  requiredGestures: new PointerMap(),
  eventMap: Object.create(null),
  // Scope objects for native events.
  // This exists for ease of testing.
  eventSources: Object.create(null),
  eventSourceList: [],
  gestures: [],
  // map gesture event -> {listeners: int, index: gestures[int]}
  dependencyMap: {
    // make sure down and up are in the map to trigger "register"
    down: {listeners: 0, index: -1},
    up: {listeners: 0, index: -1}
  },
  gestureQueue: [],
  /**
   * Add a new event source that will generate pointer events.
   *
   * `inSource` must contain an array of event names named `events`, and
   * functions with the names specified in the `events` array.
   * @param {string} name A name for the event source
   * @param {Object} source A new source of platform events.
   */
  registerSource(name, source) {
    let s = source;
    let newEvents = s.events;
    if (newEvents) {
      newEvents.forEach(function(e) {
        if (s[e]) {
          this.eventMap[e] = s[e].bind(s);
        }
      }, this);
      this.eventSources[name] = s;
      this.eventSourceList.push(s);
    }
  },
  registerGesture(name, source) {
    let obj = Object.create(null);
    obj.listeners = 0;
    obj.index = this.gestures.length;
    for (let i = 0, g; i < source.exposes.length; i++) {
      g = source.exposes[i].toLowerCase();
      this.dependencyMap[g] = obj;
    }
    this.gestures.push(source);
  },
  register(element, initial) {
    let l = this.eventSourceList.length;
    for (let i = 0, es; (i < l) && (es = this.eventSourceList[i]); i++) {
      // call eventsource register
      es.register.call(es, element, initial);
    }
  },
  unregister(element) {
    let l = this.eventSourceList.length;
    for (let i = 0, es; (i < l) && (es = this.eventSourceList[i]); i++) {
      // call eventsource register
      es.unregister.call(es, element);
    }
  },
  // EVENTS
  down(inEvent) {
    this.requiredGestures.set(inEvent.pointerId, currentGestures);

    this.fireEvent('down', inEvent);
  },
  move(inEvent) {
    // pipe move events into gesture queue directly
    inEvent.type = 'move';
    this.fillGestureQueue(inEvent);
  },
  up(inEvent) {
    this.fireEvent('up', inEvent);
    this.requiredGestures.delete(inEvent.pointerId);
  },
  cancel(inEvent) {
    inEvent.tapPrevented = true;
    this.fireEvent('up', inEvent);
    this.requiredGestures.delete(inEvent.pointerId);
  },
  addGestureDependency(node, currentGestures) {
    let gesturesWanted = node.__pgEvents;
    if (gesturesWanted && currentGestures) {
      let gk = Object.keys(gesturesWanted);
      for (let i = 0, r, ri, g; i < gk.length; i++) {
        // gesture
        g = gk[i];
        if (gesturesWanted[g] > 0) {
          // lookup gesture recognizer
          r = this.dependencyMap[g];
          // recognizer index
          ri = r ? r.index : -1;
          currentGestures[ri] = true;
        }
      }
    }
  },
  // LISTENER LOGIC
  eventHandler(inEvent) {
    // This is used to prevent multiple dispatch of events from
    // platform events. This can happen when two elements in different scopes
    // are set up to create pointer events, which is relevant to Shadow DOM.

    let type = inEvent.type;

    // only generate the list of desired events on "down"
    if (type === 'touchstart' || type === 'mousedown' || type === 'pointerdown' || type === 'MSPointerDown') {
      if (!inEvent._handledByPG) {
        currentGestures = {};
      }

      // in IOS mode, there is only a listener on the document, so this is not re-entrant
      if (this.IS_IOS) {
        let ev = inEvent;
        if (type === 'touchstart') {
          let ct = inEvent.changedTouches[0];
          // set up a fake event to give to the path builder
          ev = {target: inEvent.target, clientX: ct.clientX, clientY: ct.clientY, path: inEvent.path};
        }
        // use event path if available, otherwise build a path from target finding
        let nodes = inEvent.path || targetFinding.path(ev);
        for (let i = 0, n; i < nodes.length; i++) {
          n = nodes[i];
          this.addGestureDependency(n, currentGestures);
        }
      } else {
        this.addGestureDependency(inEvent.currentTarget, currentGestures);
      }
    }

    if (inEvent._handledByPG) {
      return;
    }
    let fn = this.eventMap && this.eventMap[type];
    if (fn) {
      fn(inEvent);
    }
    inEvent._handledByPG = true;
  },
  // set up event listeners
  listen(target, events) {

    for (let i = 0, l = events.length, e; (i < l) && (e = events[i]); i++) {
      this.addEvent(target, e);
    }
  },
  // remove event listeners
  unlisten(target, events) {
    for (let i = 0, l = events.length, e; (i < l) && (e = events[i]); i++) {
      this.removeEvent(target, e);
    }
  },
  addEvent(target, eventName) {

    target.addEventListener(eventName, this.boundHandler);
  },
  removeEvent(target, eventName) {
    target.removeEventListener(eventName, this.boundHandler);
  },
  // EVENT CREATION AND TRACKING
  /**
   * Creates a new Event of type `inType`, based on the information in
   * `inEvent`.
   *
   * @param {string} inType A string representing the type of event to create
   * @param {Event} inEvent A platform event with a target
   * @return {Event} A PointerEvent of type `inType`
   */
  makeEvent(inType, inEvent) {
    let e = eventFactory.makePointerEvent(inType, inEvent);
    e.preventDefault = inEvent.preventDefault;
    e.tapPrevented = inEvent.tapPrevented;
    e._target = e._target || inEvent.target;
    return e;
  },
  // make and dispatch an event in one call
  fireEvent(inType, inEvent) {
    let e = this.makeEvent(inType, inEvent);
    return this.dispatchEvent(e);
  },
  /**
   * Returns a snapshot of inEvent, with writable properties.
   *
   * @param {Event} inEvent An event that contains properties to copy.
   * @return {Object} An object containing shallow copies of `inEvent`'s
   *    properties.
   */
  cloneEvent(inEvent) {
    let eventCopy = Object.create(null), p;
    for (let i = 0; i < CLONE_PROPS.length; i++) {
      p = CLONE_PROPS[i];
      eventCopy[p] = inEvent[p] || CLONE_DEFAULTS[i];
      // Work around SVGInstanceElement shadow tree
      // Return the <use> element that is represented by the instance for Safari, Chrome, IE.
      // This is the behavior implemented by Firefox.
      if (p === 'target' || p === 'relatedTarget') {
        if (HAS_SVG_INSTANCE && eventCopy[p] instanceof SVGElementInstance) {
          eventCopy[p] = eventCopy[p].correspondingUseElement;
        }
      }
    }
    // keep the semantics of preventDefault
    eventCopy.preventDefault = function() {
      inEvent.preventDefault();
    };
    return eventCopy;
  },
  /**
   * Dispatches the event to its target.
   *
   * @param {Event} inEvent The event to be dispatched.
   * @return {Boolean} True if an event handler returns true, false otherwise.
   */
  dispatchEvent(inEvent) {

    let t = inEvent._target;
    if (t) {
      t.dispatchEvent(inEvent);
      // clone the event for the gesture system to process
      // clone after dispatch to pick up gesture prevention code
      let clone = this.cloneEvent(inEvent);

      clone.target = t;
      this.fillGestureQueue(clone);
    }
  },
  gestureTrigger() {
    // process the gesture queue
    for (let i = 0, e, rg; i < this.gestureQueue.length; i++) {
      e = this.gestureQueue[i];
      rg = e._requiredGestures;
      if (rg) {
        for (let j = 0, g, fn; j < this.gestures.length; j++) {
          // only run recognizer if an element in the source event's path is listening for those gestures
          if (rg[j]) {
            g = this.gestures[j];
            fn = g[e.type];
            if (fn) {
              fn.call(g, e);
            }
          }
        }
      }
    }
    this.gestureQueue.length = 0;
  },
  fillGestureQueue(ev) {
    // only trigger the gesture queue once
    if (!this.gestureQueue.length) {
      requestAnimationFrame(this.boundGestureTrigger);
    }
    ev._requiredGestures = this.requiredGestures.get(ev.pointerId);
    this.gestureQueue.push(ev);
  }
};


dispatcher.boundHandler = dispatcher.eventHandler.bind(dispatcher);
dispatcher.boundGestureTrigger = dispatcher.gestureTrigger.bind(dispatcher);
//window.__PolymerGestures__.dispatcher = dispatcher;
export default dispatcher;

/**
 * Listen for `gesture` on `node` with the `handler` function
 *
 * If `handler` is the first listener for `gesture`, the underlying gesture recognizer is then enabled.
 *
 * @param {Element} node
 * @param {string} gesture
 * @return Boolean `gesture` is a valid gesture
 */
 function activateGesture(node, gesture) {

  let g = gesture.toLowerCase();
  let dep = dispatcher.dependencyMap[g];
  if (dep) {
    let recognizer = dispatcher.gestures[dep.index];
    if (!node.__pgListeners) {
      dispatcher.register(node);
      node.__pgListeners = 0;
    }
    // TODO(dfreedm): re-evaluate bookkeeping to avoid using attributes
    if (recognizer) {
      let touchAction = recognizer.defaultActions && recognizer.defaultActions[g];
      let actionNode;
      switch(node.nodeType) {
        case Node.ELEMENT_NODE:
          actionNode = node;
          break;
        case Node.DOCUMENT_FRAGMENT_NODE:
          actionNode = node.host;
          break;
        default:
          actionNode = null;
          break;
      }
      if (touchAction && actionNode && !actionNode.hasAttribute('touch-action')) {
        actionNode.setAttribute('touch-action', touchAction);
      }
    }
    if (!node.__pgEvents) {
      node.__pgEvents = {};
    }
    node.__pgEvents[g] = (node.__pgEvents[g] || 0) + 1;
    node.__pgListeners++;
  }

  return Boolean(dep);
}

/**
 *
 * Listen for `gesture` from `node` with `handler` function.
 *
 * @param {Element} node
 * @param {string} gesture
 * @param {Function} handler
 * @param {Boolean} capture
 */
export let addEventListener = function(node, gesture, handler, capture) {

  if (handler) {
    activateGesture(node, gesture);
    node.addEventListener(gesture, handler, capture);
  }
};




/**
 * Tears down the gesture configuration for `node`
 *
 * If `handler` is the last listener for `gesture`, the underlying gesture recognizer is disabled.
 *
 * @param {Element} node
 * @param {string} gesture
 * @return Boolean `gesture` is a valid gesture
 */
function deactivateGesture (node, gesture) {
  let g = gesture.toLowerCase();
  let dep = dispatcher.dependencyMap[g];
  if (dep) {
    if (node.__pgListeners > 0) {
      node.__pgListeners--;
    }
    if (node.__pgListeners === 0) {
      dispatcher.unregister(node);
    }
    if (node.__pgEvents) {
      if (node.__pgEvents[g] > 0) {
        node.__pgEvents[g]--;
      } else {
        node.__pgEvents[g] = 0;
      }
    }
  }
  return Boolean(dep);
}


/**
 * Stop listening for `gesture` from `node` with `handler` function.
 *
 * @param {Element} node
 * @param {string} gesture
 * @param {Function} handler
 * @param {Boolean} capture
 */
export let removeEventListener = function(node, gesture, handler, capture) {
  if (handler) {
    deactivateGesture(node, gesture);
    node.removeEventListener(gesture, handler, capture);
  }
};

