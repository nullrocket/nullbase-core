/*
 * Scroller
 * http://github.com/zynga/scroller
 *
 * Copyright 2011, Zynga Inc.
 * Licensed under the MIT License.
 * https://raw.github.com/zynga/scroller/master/MIT-LICENSE.txt
 *
 * Based on the work of: Unify Project (unify-project.org)
 * http://unify-project.org
 * Copyright 2011, Deutsche Telekom AG
 * License: MIT + Apache (V2)
 */

import core from './animate';


let NOOP = function () {};

/**
 * A pure logic 'component' for 'virtual' scrolling/zooming.
 */
let Scroller = function ( callback, options ) {

  this._callback = callback;

  this.options = {

    /** Enable scrolling on x-axis */
    scrollingX: true,

    /** Enable scrolling on y-axis */
    scrollingY: true,

    /** Enable animations for deceleration, snap back, zooming and scrolling */
    animating: true,

    /** duration for animations triggered by scrollTo/zoomTo */
    animationDuration: 250,

    /** Enable bouncing (content can be slowly moved outside and jumps back after releasing) */
    bouncing: true,

    /** Enable locking to the main axis if user moves only slightly on one of them at start */
    locking: true,

    /** Enable pagination mode (switching between full page content panes) */
    paging: false,

    /** Enable snapping of content to a configured pixel grid */
    snapping: false,

    /** Enable zooming of content via API, fingers and mouse wheel */
    zooming: false,

    /** Minimum zoom level */
    minZoom: 0.5,

    /** Maximum zoom level */
    maxZoom: 3,

    /** Multiply or decrease scrolling speed **/
    speedMultiplier: 1,

    /** Callback that is fired on the later of touch end or deceleration end,
     provided that another scrolling action has not begun. Used to know
     when to fade out a scrollbar. */
    scrollingComplete: NOOP,

    /** This configures the amount of change applied to deceleration when reaching boundaries  **/
    penetrationDeceleration: 0.03,

    /** This configures the amount of change applied to acceleration when reaching boundaries  **/
    penetrationAcceleration: 0.08

  };

  for ( let key in options ) {
    this.options[ key ] = options[ key ];
  }

};


// Easing Equations (c) 2003 Robert Penner, all rights reserved.
// Open source under the BSD License.

/**
 * @param pos {Number} position between 0 (start of effect) and 1 (end of effect)
 **/
let easeOutCubic = function ( pos ) {
  return (Math.pow((pos - 1), 3) + 1);
};

/**
 * @param pos {Number} position between 0 (start of effect) and 1 (end of effect)
 **/
let easeInOutCubic = function ( pos ) {
  if ( (pos /= 0.5) < 1 ) {
    return 0.5 * Math.pow(pos, 3);
  }

  return 0.5 * (Math.pow((pos - 2), 3) + 2);
};


let members = {

  /*
   ---------------------------------------------------------------------------
   INTERNAL FIELDS :: STATUS
   ---------------------------------------------------------------------------
   */

  /** {Boolean} Whether only a single finger is used in touch handling */
  _isSingleTouch: false,

  /** {Boolean} Whether a touch event sequence is in progress */
  _isTracking: false,

  /** {Boolean} Whether a deceleration animation went to completion. */
  _didDecelerationComplete: false,

  /**
   * {Boolean} Whether a gesture zoom/rotate event is in progress. Activates when
   * a gesturestart event happens. This has higher priority than dragging.
   */
  _isGesturing: false,

  /**
   * {Boolean} Whether the user has moved by such a distance that we have enabled
   * dragging mode. Hint: It's only enabled after some pixels of movement to
   * not interrupt with clicks etc.
   */
  _isDragging: false,

  /**
   * {Boolean} Not touching and dragging anymore, and smoothly animating the
   * touch sequence using deceleration.
   */
  _isDecelerating: false,

  /**
   * {Boolean} Smoothly animating the currently configured change
   */
  _isAnimating: false,


  /*
   ---------------------------------------------------------------------------
   INTERNAL FIELDS :: DIMENSIONS
   ---------------------------------------------------------------------------
   */

  /** {Integer} Available outer left position (from document perspective) */
  _clientLeft: 0,

  /** {Integer} Available outer top position (from document perspective) */
  _clientTop: 0,

  /** {Integer} Available outer width */
  _clientWidth: 0,

  /** {Integer} Available outer height */
  _clientHeight: 0,

  /** {Integer} Outer width of content */
  _contentWidth: 0,

  /** {Integer} Outer height of content */
  _contentHeight: 0,

  /** {Integer} Snapping width for content */
  _snapWidth: 100,

  /** {Integer} Snapping height for content */
  _snapHeight: 100,

  /** {Integer} Height to assign to refresh area */
  _refreshHeight: null,

  /** {Boolean} Whether the refresh process is enabled when the event is released now */
  _refreshActive: false,

  /** {Function} Callback to execute on activation. This is for signalling the user about a refresh is about to happen when he release */
  _refreshActivate: null,

  /** {Function} Callback to execute on deactivation. This is for signalling the user about the refresh being cancelled */
  _refreshDeactivate: null,

  /** {Function} Callback to execute to start the actual refresh.  */
  _refreshStart: null,

  /** {Number} Zoom level */
  _zoomLevel: 1,

  /** {Number} Scroll position on x-axis */
  _scrollLeft: 0,

  /** {Number} Scroll position on y-axis */
  _scrollTop: 0,

  /** {Integer} Maximum allowed scroll position on x-axis */
  _maxScrollLeft: 0,

  /** {Integer} Maximum allowed scroll position on y-axis */
  _maxScrollTop: 0,

  /* {Number} Scheduled left position (final position when animating) */
  _scheduledLeft: 0,

  /* {Number} Scheduled top position (final position when animating) */
  _scheduledTop: 0,

  /* {Number} Scheduled zoom level (final scale when animating) */
  _scheduledZoom: 0,


  /*
   ---------------------------------------------------------------------------
   INTERNAL FIELDS :: LAST POSITIONS
   ---------------------------------------------------------------------------
   */

  /** {Number} Left position of finger at start */
  _lastTouchLeft: null,

  /** {Number} Top position of finger at start */
  _lastTouchTop: null,

  /** {Date} Timestamp of last move of finger. Used to limit tracking range for deceleration speed. */
  _lastTouchMove: null,

  /** {Array} List of positions, uses three indexes for each state: left, top, timestamp */
  _positions: null,


  /*
   ---------------------------------------------------------------------------
   INTERNAL FIELDS :: DECELERATION SUPPORT
   ---------------------------------------------------------------------------
   */

  /** {Integer} Minimum left scroll position during deceleration */
  _minDecelerationScrollLeft: null,

  /** {Integer} Minimum top scroll position during deceleration */
  _minDecelerationScrollTop: null,

  /** {Integer} Maximum left scroll position during deceleration */
  _maxDecelerationScrollLeft: null,

  /** {Integer} Maximum top scroll position during deceleration */
  _maxDecelerationScrollTop: null,

  /** {Number} Current factor to modify horizontal scroll position with on every step */
  _decelerationVelocityX: null,

  /** {Number} Current factor to modify vertical scroll position with on every step */
  _decelerationVelocityY: null,


  /*
   ---------------------------------------------------------------------------
   PUBLIC API
   ---------------------------------------------------------------------------
   */

  /**
   * Configures the dimensions of the client (outer) and content (inner) elements.
   * Requires the available space for the outer element and the outer size of the inner element.
   * All values which are falsy (null or zero etc.) are ignored and the old value is kept.
   *
   * @param clientWidth {Integer ? null} Inner width of outer element
   * @param clientHeight {Integer ? null} Inner height of outer element
   * @param contentWidth {Integer ? null} Outer width of inner element
   * @param contentHeight {Integer ? null} Outer height of inner element
   */
  setDimensions: function ( clientWidth, clientHeight, contentWidth, contentHeight ) {

    // Only update values which are defined
    if ( clientWidth === +clientWidth ) {
      this._clientWidth = clientWidth;
    }

    if ( clientHeight === +clientHeight ) {
      this._clientHeight = clientHeight;
    }

    if ( contentWidth === +contentWidth ) {
      this._contentWidth = contentWidth;
    }

    if ( contentHeight === +contentHeight ) {
      this._contentHeight = contentHeight;
    }

    // Refresh maximums
    this._computeScrollMax();

    // Refresh scroll position
    this.scrollTo(this._scrollLeft, this._scrollTop, true);

  },


  /**
   * Sets the client coordinates in relation to the document.
   *
   * @param left {Integer ? 0} Left position of outer element
   * @param top {Integer ? 0} Top position of outer element
   */
  setPosition: function ( left, top ) {
    this._clientLeft = left || 0;
    this._clientTop = top || 0;
  },


  /**
   * Configures the snapping (when snapping is active)
   *
   * @param width {Integer} Snapping width
   * @param height {Integer} Snapping height
   */
  setSnapSize: function ( width, height ) {


    this._snapWidth = width;
    this._snapHeight = height;

  },


  /**
   * Activates pull-to-refresh. A special zone on the top of the list to start a list refresh whenever
   * the user event is released during visibility of this zone. This was introduced by some apps on iOS like
   * the official Twitter client.
   *
   * @param height {Integer} Height of pull-to-refresh zone on top of rendered list
   * @param activateCallback {Function} Callback to execute on activation. This is for signalling the user about a refresh is about to happen when he release.
   * @param deactivateCallback {Function} Callback to execute on deactivation. This is for signalling the user about the refresh being cancelled.
   * @param startCallback {Function} Callback to execute to start the real async refresh action. Call {@link #finishPullToRefresh} after finish of refresh.
   */
  activatePullToRefresh: function ( height, activateCallback, deactivateCallback, startCallback ) {


    this._refreshHeight = height;
    this._refreshActivate = activateCallback;
    this._refreshDeactivate = deactivateCallback;
    this._refreshStart = startCallback;

  },


  /**
   * Starts pull-to-refresh manually.
   */
  triggerPullToRefresh: function () {
    // Use publish instead of scrollTo to allow scrolling to out of boundary position
    // We don't need to normalize scrollLeft, zoomLevel, etc. here because we are only y-scrolling when pull-to-refresh is enabled
    this._publish(this._scrollLeft, -this._refreshHeight, this._zoomLevel, true);

    if ( this._refreshStart ) {
      this._refreshStart();
    }
  },


  /**
   * Signals that pull-to-refresh is finished.
   */
  finishPullToRefresh: function () {


    this._refreshActive = false;
    if ( this._refreshDeactivate ) {
      this._refreshDeactivate();
    }
    this.scrollTo(this._scrollLeft, this._scrollTop, true);

  },


  /**
   * Returns the scroll position and zooming values
   *
   * @return {Object} `left` and `top` scroll position and `zoom` level
   */
  getValues: function () {

    return {
      left: this._scrollLeft,
      top: this._scrollTop,
      zoom: this._zoomLevel
    };

  },


  /**
   * Returns the maximum scroll values
   *
   * @return {Map} `left` and `top` maximum scroll values
   */
  getScrollMax: function () {


    return {
      left: this._maxScrollLeft,
      top: this._maxScrollTop
    };

  },


  /**
   * Zooms to the given level. Supports optional animation. Zooms
   * the center when no coordinates are given.
   *
   * @param level {Number} Level to zoom to
   * @param animate {Boolean ? false} Whether to use animation
   * @param originLeft {Number ? null} Zoom in at given left coordinate
   * @param originTop {Number ? null} Zoom in at given top coordinate
   * @param callback {Function ? null} A callback that gets fired when the zoom is complete.
   */
  zoomTo: function ( level, animate, originLeft, originTop, callback ) {



    if ( !this.options.zooming ) {
      throw new Error("Zooming is not enabled!");
    }

    // Add callback if exists
    if ( callback ) {
      this._zoomComplete = callback;
    }

    // Stop deceleration
    if ( this._isDecelerating ) {
      core.effect.Animate.stop(this._isDecelerating);
      this._isDecelerating = false;
    }

    let oldLevel = this._zoomLevel;

    // Normalize input origin to center of viewport if not defined
    if ( originLeft === null || originLeft === undefined ) {
      originLeft = this._clientWidth / 2;
    }

    if ( originTop === null  || originTop === undefined) {
      originTop = this._clientHeight / 2;
    }

    // Limit level according to configuration
    level = Math.max(Math.min(level, this.options.maxZoom), this.options.minZoom);

    // Recompute maximum values while temporary tweaking maximum scroll ranges
    this._computeScrollMax(level);

    // Recompute left and top coordinates based on new zoom level
    let left = ((originLeft + this._scrollLeft) * level / oldLevel) - originLeft;
    let top = ((originTop + this._scrollTop) * level / oldLevel) - originTop;

    // Limit x-axis
    if ( left > this._maxScrollLeft ) {
      left = this._maxScrollLeft;
    }
    else if ( left < 0 ) {
      left = 0;
    }

    // Limit y-axis
    if ( top > this._maxScrollTop ) {
      top = this._maxScrollTop;
    }
    else if ( top < 0 ) {
      top = 0;
    }

    // Push values out
    this._publish(left, top, level, animate);

  },


  /**
   * Zooms the content by the given factor.
   *
   * @param factor {Number} Zoom by given factor
   * @param animate {Boolean ? false} Whether to use animation
   * @param originLeft {Number ? 0} Zoom in at given left coordinate
   * @param originTop {Number ? 0} Zoom in at given top coordinate
   * @param callback {Function ? null} A callback that gets fired when the zoom is complete.
   */
  zoomBy: function ( factor, animate, originLeft, originTop, callback ) {


    this.zoomTo(this._zoomLevel * factor, animate, originLeft, originTop, callback);

  },


  /**
   * Scrolls to the given position. Respect limitations and snapping automatically.
   *
   * @param left {Number?null} Horizontal scroll position, keeps current if value is <code>null</code>
   * @param top {Number?null} Vertical scroll position, keeps current if value is <code>null</code>
   * @param animate {Boolean?false} Whether the scrolling should happen using an animation
   * @param zoom {Number?null} Zoom level to go to
   */
  scrollTo: function ( left, top, animate, zoom ) {


    // Stop deceleration
    if ( this._isDecelerating ) {
      core.effect.Animate.stop(this._isDecelerating);
      this._isDecelerating = false;
    }

    // Correct coordinates based on new zoom level

    if ( (zoom !== null && zoom !== undefined ) &&  zoom !== this._zoomLevel ) {

      if ( !this.options.zooming ) {
        throw new Error("Zooming is not enabled!");
      }

      left *= zoom;
      top *= zoom;

      // Recompute maximum values while temporary tweaking maximum scroll ranges
      this._computeScrollMax(zoom);

    }
    else {

      // Keep zoom when not defined
      zoom = this._zoomLevel;

    }

    if ( !this.options.scrollingX ) {

      left = this._scrollLeft;

    }
    else {

      if ( this.options.paging ) {
        left = Math.round(left / this._clientWidth) * this._clientWidth;
      }
      else if ( this.options.snapping ) {
        left = Math.round(left / this._snapWidth) * this._snapWidth;
      }

    }

    if ( !this.options.scrollingY ) {

      top = this._scrollTop;

    }
    else {

      if ( this.options.paging ) {
        top = Math.round(top / this._clientHeight) * this._clientHeight;
      }
      else if ( this.options.snapping ) {
        top = Math.round(top / this._snapHeight) * this._snapHeight;
      }

    }

    // Limit for allowed ranges
    left = Math.max(Math.min(this._maxScrollLeft, left), 0);
    top = Math.max(Math.min(this._maxScrollTop, top), 0);

    // Don't animate when no change detected, still call publish to make sure
    // that rendered position is really in-sync with internal data
    if ( left === this._scrollLeft && top === this._scrollTop ) {
      animate = false;
    }

    // Publish new values

    //	if (!this._isTracking) {
    this._publish(left, top, zoom, animate);
    //}

  },


  /**
   * Scroll by the given offset
   *
   * @param left {Number ? 0} Scroll x-axis by given offset
   * @param top {Number ? 0} Scroll x-axis by given offset
   * @param animate {Boolean ? false} Whether to animate the given change
   */
  scrollBy: function ( left, top, animate ) {



    let startLeft = this._isAnimating ? this._scheduledLeft : this._scrollLeft;
    let startTop = this._isAnimating ? this._scheduledTop : this._scrollTop;

    this.scrollTo(startLeft + (left || 0), startTop + (top || 0), animate);

  },


  /*
   ---------------------------------------------------------------------------
   EVENT CALLBACKS
   ---------------------------------------------------------------------------
   */

  /**
   * Mouse wheel handler for zooming support
   */
  doMouseZoom: function ( wheelDelta, timeStamp, pageX, pageY ) {

    
    let change = wheelDelta > 0 ? 0.97 : 1.03;

    return this.zoomTo(this._zoomLevel * change, false, pageX - this._clientLeft, pageY - this._clientTop);

  },


  /**
   * Touch start handler for scrolling support
   */
  doTouchStart: function ( touches, timeStamp ) {

    // Array-like check is enough here
    if ( touches.length === null  || touches.length === undefined) {
      throw new Error("Invalid touch list: " + touches);
    }

    if ( timeStamp instanceof Date ) {
      timeStamp = timeStamp.valueOf();
    }
    if ( typeof timeStamp !== "number" ) {
      throw new Error("Invalid timestamp value: " + timeStamp);
    }



    // Reset interruptedAnimation flag
    this._interruptedAnimation = true;

    // Stop deceleration
    if ( this._isDecelerating ) {
      core.effect.Animate.stop(this._isDecelerating);
      this._isDecelerating = false;
      this._interruptedAnimation = true;
    }

    // Stop animation
    if ( this._isAnimating ) {
      core.effect.Animate.stop(this._isAnimating);
      this._isAnimating = false;
      this._interruptedAnimation = true;
    }

    // Use center point when dealing with two fingers
    let currentTouchLeft, currentTouchTop;
    let isSingleTouch = touches.length === 1;
    if ( isSingleTouch ) {
      currentTouchLeft = touches[ 0 ].pageX;
      currentTouchTop = touches[ 0 ].pageY;
    }
    else {
      currentTouchLeft = Math.abs(touches[ 0 ].pageX + touches[ 1 ].pageX) / 2;
      currentTouchTop = Math.abs(touches[ 0 ].pageY + touches[ 1 ].pageY) / 2;
    }

    // Store initial positions
    this._initialTouchLeft = currentTouchLeft;
    this._initialTouchTop = currentTouchTop;

    // Store current zoom level
    this._zoomLevelStart = this._zoomLevel;

    // Store initial touch positions
    this._lastTouchLeft = currentTouchLeft;
    this._lastTouchTop = currentTouchTop;

    // Store initial move time stamp
    this._lastTouchMove = timeStamp;

    // Reset initial scale
    this._lastScale = 1;

    // Reset locking flags
    this._enableScrollX = !isSingleTouch && this.options.scrollingX;
    this._enableScrollY = !isSingleTouch && this.options.scrollingY;

    // Reset tracking flag
    this._isTracking = true;

    // Reset deceleration complete flag
    this._didDecelerationComplete = false;

    // Dragging starts directly with two fingers, otherwise lazy with an offset
    this._isDragging = !isSingleTouch;

    // Some features are disabled in multi touch scenarios
    this._isSingleTouch = isSingleTouch;

    // Clearing data structure
    this._positions = [];

  },


  /**
   * Touch move handler for scrolling support
   */
  doTouchMove: function ( touches, timeStamp, scale ) {

    // Array-like check is enough here
    if ( touches.length === null || touches.length === undefined) {
      throw new Error("Invalid touch list: " + touches);
    }

    if ( timeStamp instanceof Date ) {
      timeStamp = timeStamp.valueOf();
    }
    if ( typeof timeStamp !== "number" ) {
      throw new Error("Invalid timestamp value: " + timeStamp);
    }



    // Ignore event when tracking is not enabled (event might be outside of element)
    if ( !this._isTracking ) {

      return;
    }


    let currentTouchLeft, currentTouchTop;

    // Compute move based around of center of fingers
    if ( touches.length === 2 ) {
      currentTouchLeft = Math.abs(touches[ 0 ].pageX + touches[ 1 ].pageX) / 2;
      currentTouchTop = Math.abs(touches[ 0 ].pageY + touches[ 1 ].pageY) / 2;
    }
    else {
      currentTouchLeft = touches[ 0 ].pageX;
      currentTouchTop = touches[ 0 ].pageY;
    }

    let positions = this._positions;

    // Are we already is dragging mode?
    if ( this._isDragging ) {

      // Compute move distance
      let moveX = currentTouchLeft - this._lastTouchLeft;
      let moveY = currentTouchTop - this._lastTouchTop;

      // Read previous scroll position and zooming
      let scrollLeft = this._scrollLeft;
      let scrollTop = this._scrollTop;
      let level = this._zoomLevel;

      // Work with scaling
      if ( scale !== null && this.options.zooming ) {

        let oldLevel = level;

        // Recompute level based on previous scale and new scale
        level = level / this._lastScale * scale;

        // Limit level according to configuration
        level = Math.max(Math.min(level, this.options.maxZoom), this.options.minZoom);

        // Only do further compution when change happened
        if ( oldLevel !== level ) {

          // Compute relative event position to container
          let currentTouchLeftRel = currentTouchLeft - this._clientLeft;
          let currentTouchTopRel = currentTouchTop - this._clientTop;

          // Recompute left and top coordinates based on new zoom level
          scrollLeft = ((currentTouchLeftRel + scrollLeft) * level / oldLevel) - currentTouchLeftRel;
          scrollTop = ((currentTouchTopRel + scrollTop) * level / oldLevel) - currentTouchTopRel;

          // Recompute max scroll values
          this._computeScrollMax(level);

        }
      }

      if ( this._enableScrollX ) {

        scrollLeft -= moveX * this.options.speedMultiplier;
        let maxScrollLeft = this._maxScrollLeft;

        if ( scrollLeft > maxScrollLeft || scrollLeft < 0 ) {

          // Slow down on the edges
          if ( this.options.bouncing ) {

            scrollLeft += (moveX / 2 * this.options.speedMultiplier);

          }
          else if ( scrollLeft > maxScrollLeft ) {

            scrollLeft = maxScrollLeft;

          }
          else {

            scrollLeft = 0;

          }
        }
      }

      // Compute new vertical scroll position
      if ( this._enableScrollY ) {

        scrollTop -= moveY * this.options.speedMultiplier;
        let maxScrollTop = this._maxScrollTop;

        if ( scrollTop > maxScrollTop || scrollTop < 0 ) {

          // Slow down on the edges
          if ( this.options.bouncing ) {

            scrollTop += (moveY / 2 * this.options.speedMultiplier);

            // Support pull-to-refresh (only when only y is scrollable)
            if ( !this._enableScrollX && this._refreshHeight !== null ) {

              if ( !this._refreshActive && scrollTop <= -this._refreshHeight ) {

                this._refreshActive = true;
                if ( this._refreshActivate ) {
                  this._refreshActivate();
                }

              }
              else if ( this._refreshActive && scrollTop > -this._refreshHeight ) {

                this._refreshActive = false;
                if ( this._refreshDeactivate ) {
                  this._refreshDeactivate();
                }

              }
            }

          }
          else if ( scrollTop > maxScrollTop ) {

            scrollTop = maxScrollTop;

          }
          else {

            scrollTop = 0;

          }
        }
      }

      // Keep list from growing infinitely (holding min 10, max 20 measure points)
      if ( positions.length > 60 ) {
        positions.splice(0, 30);
      }

      // Track scroll movement for decleration
      positions.push(scrollLeft, scrollTop, timeStamp);

      // Sync scroll position

      this._publish(scrollLeft, scrollTop, level);

      // Otherwise figure out whether we are switching into dragging mode now.
    }
    else {

      let minimumTrackingForScroll = this.options.locking ? 3 : 0;
      let minimumTrackingForDrag = 5;

      let distanceX = Math.abs(currentTouchLeft - this._initialTouchLeft);
      let distanceY = Math.abs(currentTouchTop - this._initialTouchTop);

      this._enableScrollX = this.options.scrollingX && distanceX >= minimumTrackingForScroll;
      this._enableScrollY = this.options.scrollingY && distanceY >= minimumTrackingForScroll;

      positions.push(this._scrollLeft, this._scrollTop, timeStamp);

      this._isDragging = (this._enableScrollX || this._enableScrollY) && (distanceX >= minimumTrackingForDrag || distanceY >= minimumTrackingForDrag);
      if ( this._isDragging ) {
        this._interruptedAnimation = false;
      }

    }

    // Update last touch positions and time stamp for next event
    this._lastTouchLeft = currentTouchLeft;
    this._lastTouchTop = currentTouchTop;
    this._lastTouchMove = timeStamp;
    this._lastScale = scale;

  },


  /**
   * Touch end handler for scrolling support
   */
  doTouchEnd: function ( timeStamp ) {

    if ( timeStamp instanceof Date ) {
      timeStamp = timeStamp.valueOf();
    }
    if ( typeof timeStamp !== "number" ) {
      throw new Error("Invalid timestamp value: " + timeStamp);
    }



    // Ignore event when tracking is not enabled (no touchstart event on element)
    // This is required as this listener ('touchmove') sits on the document and not on the element itthis.
    if ( !this._isTracking ) {
      return;
    }

    // Not touching anymore (when two finger hit the screen there are two touch end events)
    this._isTracking = false;

    // Be sure to reset the dragging flag now. Here we also detect whether
    // the finger has moved fast enough to switch into a deceleration animation.
    if ( this._isDragging ) {

      // Reset dragging flag
      this._isDragging = false;

      // Start deceleration
      // Verify that the last move detected was in some relevant time frame
      if ( this._isSingleTouch && this.options.animating && (timeStamp - this._lastTouchMove) <= 100 ) {

        // Then figure out what the scroll position was about 100ms ago
        let positions = this._positions;
        let endPos = positions.length - 1;
        let startPos = endPos;

        // Move pointer to position measured 100ms ago
        for ( let i = endPos; i > 0 && positions[ i ] > (this._lastTouchMove - 100); i -= 3 ) {
          startPos = i;
        }

        // If start and stop position is identical in a 100ms timeframe,
        // we cannot compute any useful deceleration.
        if ( startPos !== endPos ) {

          // Compute relative movement between these two points
          let timeOffset = positions[ endPos ] - positions[ startPos ];
          let movedLeft = this._scrollLeft - positions[ startPos - 2 ];
          let movedTop = this._scrollTop - positions[ startPos - 1 ];

          // Based on 50ms compute the movement to apply for each render step
          this._decelerationVelocityX = movedLeft / timeOffset * (1000 / 60);
          this._decelerationVelocityY = movedTop / timeOffset * (1000 / 60);

          // How much velocity is required to start the deceleration
          let minVelocityToStartDeceleration = this.options.paging || this.options.snapping ? 4 : 1;

          // Verify that we have enough velocity to start deceleration
          if ( Math.abs(this._decelerationVelocityX) > minVelocityToStartDeceleration || Math.abs(this._decelerationVelocityY) > minVelocityToStartDeceleration ) {

            // Deactivate pull-to-refresh when decelerating
            if ( !this._refreshActive ) {
              this._startDeceleration(timeStamp);
            }
          }
          else {
            this.options.scrollingComplete();
          }
        }
        else {
          this.options.scrollingComplete();
        }
      }
      else if ( (timeStamp - this._lastTouchMove) > 100 ) {
        this.options.scrollingComplete();
      }
    }

    // If this was a slower move it is per default non decelerated, but this
    // still means that we want snap back to the bounds which is done here.
    // This is placed outside the condition above to improve edge case stability
    // e.g. touchend fired without enabled dragging. This should normally do not
    // have modified the scroll positions or even showed the scrollbars though.
    if ( !this._isDecelerating ) {

      if ( this._refreshActive && this._refreshStart ) {

        // Use publish instead of scrollTo to allow scrolling to out of boundary position
        // We don't need to normalize scrollLeft, zoomLevel, etc. here because we only y-scrolling when pull-to-refresh is enabled
        this._publish(this._scrollLeft, -this._refreshHeight, this._zoomLevel, true);

        if ( this._refreshStart ) {
          this._refreshStart();
        }

      }
      else {

        if ( this._interruptedAnimation || this._isDragging ) {
          this.options.scrollingComplete();
        }
        this.scrollTo(this._scrollLeft, this._scrollTop, true, this._zoomLevel);

        // Directly signalize deactivation (nothing todo on refresh?)
        if ( this._refreshActive ) {

          this._refreshActive = false;
          if ( this._refreshDeactivate ) {
            this._refreshDeactivate();
          }

        }
      }
    }

    // Fully cleanup list
    this._positions.length = 0;

  },


  /*
   ---------------------------------------------------------------------------
   PRIVATE API
   ---------------------------------------------------------------------------
   */

  /**
   * Applies the scroll position to the content element
   *
   * @param left {Number} Left scroll position
   * @param top {Number} Top scroll position
   * @param zoom
   * @param animate {Boolean?false} Whether animation should be used to move to the new coordinates
   */
  _publish: function ( left, top, zoom, animate ) {



    // Remember whether we had an animation, then we try to continue based on the current "drive" of the animation
    let wasAnimating = this._isAnimating;
    if ( wasAnimating ) {
      core.effect.Animate.stop(wasAnimating);
      this._isAnimating = false;
    }

    if ( animate && this.options.animating ) {

      // Keep scheduled positions for scrollBy/zoomBy functionality
      this._scheduledLeft = left;
      this._scheduledTop = top;
      this._scheduledZoom = zoom;

      let oldLeft = this._scrollLeft;
      let oldTop = this._scrollTop;
      let oldZoom = this._zoomLevel;

      let diffLeft = left - oldLeft;
      let diffTop = top - oldTop;
      let diffZoom = zoom - oldZoom;
      let self = this;
      let step =  function( percent, now, render ) {
      
        if ( render ) {

          self._scrollLeft = oldLeft + (diffLeft * percent);
          self._scrollTop = oldTop + (diffTop * percent);
          self._zoomLevel = oldZoom + (diffZoom * percent);

          // Push values out
          if ( self._callback ) {
            self._callback(self._scrollLeft, self._scrollTop, self._zoomLevel);
          }

        }
      };

      let verify = function ( id ) {
        return self._isAnimating === id;
      };

      let completed = function ( renderedFramesPerSecond, animationId, wasFinished ) {

        if ( animationId === self._isAnimating ) {
          self._isAnimating = false;
        }
        if ( self._didDecelerationComplete || wasFinished ) {
          self.options.scrollingComplete();
        }

        if ( self.options.zooming ) {
          self._computeScrollMax();
          if ( self._zoomComplete ) {
            self._zoomComplete();
            self._zoomComplete = null;
          }
        }
      };

      // When continuing based on previous animation we choose an ease-out animation instead of ease-in-out
      this._isAnimating = core.effect.Animate.start(step, verify, completed, this.options.animationDuration, wasAnimating ? easeOutCubic : easeInOutCubic);

    }
    else {

      this._scheduledLeft = this._scrollLeft = left;
      this._scheduledTop = this._scrollTop = top;
      this._scheduledZoom = this._zoomLevel = zoom;

      // Push values out
      if ( this._callback ) {
        this._callback(left, top, zoom);
      }

      // Fix max scroll ranges
      if ( this.options.zooming ) {
        this._computeScrollMax();
        if ( this._zoomComplete ) {
          this._zoomComplete();
          this._zoomComplete = null;
        }
      }
    }
  },


  /**
   * Recomputes scroll minimum values based on client dimensions and content dimensions.
   */
  _computeScrollMax: function ( zoomLevel ) {
  if ( zoomLevel === null || zoomLevel === undefined ) {
      zoomLevel = this._zoomLevel;
    }
    this._maxScrollLeft = Math.max((this._contentWidth * zoomLevel) - this._clientWidth, 0);
    this._maxScrollTop = Math.max((this._contentHeight * zoomLevel) - this._clientHeight, 0);

  },


  /*
   ---------------------------------------------------------------------------
   ANIMATION (DECELERATION) SUPPORT
   ---------------------------------------------------------------------------
   */

  /**
   * Called when a touch sequence end and the speed of the finger was high enough
   * to switch into deceleration mode.
   */
  _startDeceleration: function ( /*timeStamp*/ ) {

    let self = this;

    if ( self.options.paging ) {

      let scrollLeft = Math.max(Math.min(self._scrollLeft, self._maxScrollLeft), 0);
      let scrollTop = Math.max(Math.min(self._scrollTop, self._maxScrollTop), 0);
      let clientWidth = self._clientWidth;
      let clientHeight = self._clientHeight;

      // We limit deceleration not to the min/max values of the allowed range, but to the size of the visible client area.
      // Each page should have exactly the size of the client area.
      this._minDecelerationScrollLeft = Math.floor(scrollLeft / clientWidth) * clientWidth;
      this._minDecelerationScrollTop = Math.floor(scrollTop / clientHeight) * clientHeight;
      this._maxDecelerationScrollLeft = Math.ceil(scrollLeft / clientWidth) * clientWidth;
      this._maxDecelerationScrollTop = Math.ceil(scrollTop / clientHeight) * clientHeight;

    }
    else {

      this._minDecelerationScrollLeft = 0;
      this._minDecelerationScrollTop = 0;
      this._maxDecelerationScrollLeft = this._maxScrollLeft;
      this._maxDecelerationScrollTop = this._maxScrollTop;

    }

    // Wrap class method
    let step = function ( percent, now, render ) {
      self._stepThroughDeceleration(render);
    };

    // How much velocity is required to keep the deceleration running
    let minVelocityToKeepDecelerating = self.options.snapping ? 4 : 0.001;

    // Detect whether it's still worth to continue animating steps
    // If we are already slow enough to not being user perceivable anymore, we stop the whole process here.
    let verify = function () {
      let shouldContinue = Math.abs(self._decelerationVelocityX) >= minVelocityToKeepDecelerating || Math.abs(self._decelerationVelocityY) >= minVelocityToKeepDecelerating;
      if ( !shouldContinue ) {
        self._didDecelerationComplete = true;
      }
      return shouldContinue;
    };

    let completed = function (/* renderedFramesPerSecond, animationId, wasFinished */) {
      self._isDecelerating = false;
      if ( self._didDecelerationComplete ) {
        self.options.scrollingComplete();
      }

      // Animate to grid when snapping is active, otherwise just fix out-of-boundary positions
      self.scrollTo(self._scrollLeft, self._scrollTop, self.options.snapping);
    };

    // Start animation and switch on flag
    self._isDecelerating = core.effect.Animate.start(step, verify, completed);

  },


  /**
   * Called on every step of the animation
   *
   * @param render
   */
  _stepThroughDeceleration: function ( render ) {

    let self = this;


    //
    // COMPUTE NEXT SCROLL POSITION
    //

    // Add deceleration to scroll position
    let scrollLeft = this._scrollLeft + this._decelerationVelocityX;
    let scrollTop = this._scrollTop + this._decelerationVelocityY;


    //
    // HARD LIMIT SCROLL POSITION FOR NON BOUNCING MODE
    //

    if ( !this.options.bouncing ) {

      let scrollLeftFixed = Math.max(Math.min(this._maxDecelerationScrollLeft, scrollLeft), this._minDecelerationScrollLeft);
      if ( scrollLeftFixed !== scrollLeft ) {
        scrollLeft = scrollLeftFixed;
        this._decelerationVelocityX = 0;
      }

      let scrollTopFixed = Math.max(Math.min(this._maxDecelerationScrollTop, scrollTop), this._minDecelerationScrollTop);
      if ( scrollTopFixed !== scrollTop ) {
        scrollTop = scrollTopFixed;
        this._decelerationVelocityY = 0;
      }

    }


    //
    // UPDATE SCROLL POSITION
    //

    if ( render ) {

      this._publish(scrollLeft, scrollTop, this._zoomLevel);

    }
    else {

      this._scrollLeft = scrollLeft;
      this._scrollTop = scrollTop;

    }


    //
    // SLOW DOWN
    //

    // Slow down velocity on every iteration
    if ( !this.options.paging ) {

      // This is the factor applied to every iteration of the animation
      // to slow down the process. This should emulate natural behavior where
      // objects slow down when the initiator of the movement is removed
      let frictionFactor = 0.95;

      this._decelerationVelocityX *= frictionFactor;
      this._decelerationVelocityY *= frictionFactor;

    }


    //
    // BOUNCING SUPPORT
    //

    if ( self.options.bouncing ) {

      let scrollOutsideX = 0;
      let scrollOutsideY = 0;

      // This configures the amount of change applied to deceleration/acceleration when reaching boundaries
      let penetrationDeceleration = this.options.penetrationDeceleration;
      let penetrationAcceleration = this.options.penetrationAcceleration;

      // Check limits
      if ( scrollLeft < this._minDecelerationScrollLeft ) {
        scrollOutsideX = this._minDecelerationScrollLeft - scrollLeft;
      }
      else if ( scrollLeft > this._maxDecelerationScrollLeft ) {
        scrollOutsideX = this._maxDecelerationScrollLeft - scrollLeft;
      }

      if ( scrollTop < this._minDecelerationScrollTop ) {
        scrollOutsideY = this._minDecelerationScrollTop - scrollTop;
      }
      else if ( scrollTop > this._maxDecelerationScrollTop ) {
        scrollOutsideY = this._maxDecelerationScrollTop - scrollTop;
      }

      // Slow down until slow enough, then flip back to snap position
      if ( scrollOutsideX !== 0 ) {
        if ( scrollOutsideX * this._decelerationVelocityX <= 0 ) {
          this._decelerationVelocityX += scrollOutsideX * penetrationDeceleration;
        }
        else {
          this._decelerationVelocityX = scrollOutsideX * penetrationAcceleration;
        }
      }

      if ( scrollOutsideY !== 0 ) {
        if ( scrollOutsideY * this._decelerationVelocityY <= 0 ) {
          this._decelerationVelocityY += scrollOutsideY * penetrationDeceleration;
        }
        else {
          this._decelerationVelocityY = scrollOutsideY * penetrationAcceleration;
        }
      }
    }
  }
};

// Copy over members to prototype
for ( let key in members ) {
  Scroller.prototype[ key ] = members[ key ];
}


export default Scroller;
