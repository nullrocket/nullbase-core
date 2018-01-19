import Ember from 'ember';
import Scroller from '../../util/scroller/scroller';
import {on} from "@ember/object/evented";
import {once} from "@ember/runloop";

import layout from './template';
import {computed, observer} from "@ember/object";
import {inject} from "@ember/service";
import uniqueClass from '../../utils/uniq-class';
import AnimationFrameQueue from '../../utils/animation-frame-queue';



// TODO: Move this to utils for the theme service
let wheelDistance = function ( evt ) {
  if ( !evt ) evt = event;
  let w = evt.wheelDelta, d = evt.detail;
  if ( d ) {
    if ( w ) { return w / Math.abs(d) / 40 * (d > 0 ? -1 : 1);} // Opera
    else { return d / 10 / 3;}              // Firefox;         TODO: do not /3 for OS X
  }
  else {return -w / 10 / 120; }            // IE/Safari/Chrome TODO: /3 for Chrome OS X
};


export default Ember.Component.extend({
  layout,
  gestures: inject(),
  tagName: 'div',
  resize: inject(),

  classNames: [ '' ],
  classNameBindings: [ 'useNativeScroll:scroll-panel-native:scroll-panel', '_showVerticalScrollbar:show-vscroll-bar:hide-vscroll-bar', '_showHorizontalScrollbar:show-hscroll-bar:hide-hscroll-bar' ],
  useNativeScroll: false,
  manualUpdate: false,
  height: 0,
  width: 0,
  scrollTop: 0,
  scrollingX: true,
  scrollingY: true,
  snapWidth: 100,
  snapHeight: 100,
  animating: true,
  animationDuration: 250,
  bouncing: true,
  locking: true,
  paging: false,
  snapping: false,
  zooming: false,
  minZoom: 0.5,
  maxZoom: 3,
  _showVerticalScrollbar:computed('showVerticalScrollbar','contentHeight','height','useNativeScroll',function(){
    let show = true;

    if(this.get('showVerticalScrollbar') === 'hide')
    {
      show = false;
    }
    if(this.get('showVerticalScrollbar') === 'auto')
    {

      show = this.get('contentHeight') > this.get('height');
    }
    if(this.get('showVerticalScrollbar') === 'show' )
    {

      show = true ;
    }

    return show;
  }),

  _showHorizontalScrollbar:computed('showHorizontalScrollbar','contentWidth','width','useNativeScroll',function(){
    let show = true;

    if(this.get('showHorizontalScrollbar') === 'hide')
    {
      show = false;
    }
    if(this.get('showHorizontalScrollbar') === 'auto')
    {

      show = this.get('contentWidth') > this.get('width');
    }
    if(this.get('showHorizontalScrollbar') === 'show' )
    {

      show = true ;
    }

    return show;
  }),

  lastScrollPosition: 0,

  autoScrollbar: false,
  dragWithNativeScroll: true,
  /**
   * y
   *  'auto','hide','show'
   */
  showVerticalScrollbar: 'auto',
  /**
   * x
   *  'auto','hide','show'
   */
  showHorizontalScrollbar: 'auto',
  
  
  scrollBar: true,
  _verticalScrollbarElement: null,
  _horizontalScrollbarElement:null,

  attributeBindings: [ 'tabindex' ],
  tabindex: 0,
  touchAction: computed('useNativeScroll', function () {
    return this.get('useNativeScroll') ? "" : "none";
  }),
  scroller: null,
  adjustIntervalHandle: 0,
  _resizeListener: null,
  _lastSelected: null,
  _uniqueClassName: null,
  _AFQ_SCROLL_PANEL: null,
  _down: null,
  _track: null,
  _up: null,
  _rafArgs: null,
  contentElement: computed(function () {
    return this.get('element').querySelectorAll('.scroll-panel-content.' + this.get('_uniqueClassName'))[ 0 ];
  }),
  init() {
    this._super(...arguments);
    this.set('_rafArgs', new Array(4));
    this.set('_AFQ_SCROLL_PANEL', new AnimationFrameQueue());
    this.set('_uniqueClassName', uniqueClass());
  },
  _onRender( /*scrollLeft,scrollTop*/ ) {

  },
  _onNativeRender( /*scrollLeft,scrollType*/ ) {

  },


  useNativeScrollDidChange: observer('useNativeScroll', function () {
    once(this, this.processUseNativeScrollDidChange)
  }),


  processUseNativeScrollDidChange: function () {

    let self = this;
    let element = this.get('element');
    let contentElement = self.get('contentElement');
    let gestures = this.get('gestures');
    let vScrollRail = self.get('_verticalScrollbarElement');
    let vScrollKnob = vScrollRail.getElementsByClassName('scroll-knob')[ 0 ];
    let hScrollRail = self.get('_horizontalScrollbarElement');
    let hScrollKnob = hScrollRail.getElementsByClassName('scroll-knob')[ 0 ];
    let scroller = self.get('scroller');
    let xTop = scroller.getValues().top;
    let xLeft = scroller.getValues().left;
    scroller.setPosition(0, 0);
    this.tearDownListeners();
    scroller._callback = null;
    contentElement.style[ "transform" ] = 'translate3d(0px, 0px, 0px)';

    element.scrollTop = 0;
    element.scrollLeft = 0;

    contentElement.scrollTop = 0;
    contentElement.scrollLeft = 0;

    if ( this.get('useNativeScroll') === false ) {
      self.set('scrollBar', true);

      let _raf = () => {
        contentElement.style[ "transform" ] = 'translate3d(' + -(self._rafArgs[ 0 ]) + 'px, ' + -(self._rafArgs[ 1 ]) + 'px, 0)';
        if ( self.get('scrollBar') ) {
          vScrollKnob.style[ "transform" ] = 'translate3d(0px, ' + self._rafArgs[ 2 ] + 'px, 0)';
        }
        if ( self.get('scrollBar') ) {
          hScrollKnob.style[ "transform" ] = 'translate3d(' + self._rafArgs[ 3 ] + 'px,0px,  0)';
        }

      };

      scroller._callback = function ( scrollLeft, scrollTop /*, zoom*/ ) {
        if ( !self.get('isDestroyed') ) {
          let contentHeight = contentElement.offsetHeight;
          let viewPortHeight = self.get('height');
          let vpos =  (scrollTop ) / ((contentHeight - viewPortHeight) / (viewPortHeight - vScrollKnob.offsetHeight ));
          vpos = Math.min(isNaN(vpos)?0:vpos, (viewPortHeight - vScrollKnob.offsetHeight));

          let contentWidth = contentElement.offsetWidth;
          let viewPortWidth = self.get('width');
          let hpos =(scrollLeft ) / ((contentWidth - viewPortWidth) / (viewPortWidth - hScrollKnob.offsetWidth));

          hpos = Math.min(isNaN(hpos) ?0:hpos, (viewPortWidth - hScrollKnob.offsetWidth));

          self._rafArgs[ 0 ] = scrollLeft;
          self._rafArgs[ 1 ] = scrollTop;
          self._rafArgs[ 2 ] = vpos -15;
          self._rafArgs[ 3 ] = hpos -15;

          self.get('_AFQ_SCROLL_PANEL').clear();
          self.get('_AFQ_SCROLL_PANEL').add(_raf);
          self._onRender(scrollLeft, scrollTop);
        }

      };


      scroller.scrollTo(xLeft, xTop);

      let mousedown = false;
      self._down = function ( event ) {
        if ( !mousedown ) {
          if ( event.target.tagName.match(/input|textarea|select/i) ) {
            return;
          }
          scroller.doTouchStart([
            {
              pageX: event.pageX,
              pageY: event.pageY
            }
          ], window.performance.now());
          mousedown = true;
        }
      };

      gestures.addEventListener(contentElement, 'down', self._down);


      self._track = function ( e ) {
        e.stopPropagation();
        if ( !mousedown ) {
          return;
        }
        scroller.doTouchMove([ {
          pageX: e.pageX,
          pageY: e.pageY
        } ], window.performance.now());

      };
      gestures.addEventListener(contentElement, 'track', self._track);


      self._up = function ( e ) {

        e.stopPropagation();


        if ( !mousedown ) {
          return;
        }
        //       e.stopImmediatePropagation();
        scroller.doTouchEnd(window.performance.now());

        mousedown = false;


      };
      gestures.addEventListener(document, 'trackend', self._up);
      self._wheel = function ( event ) {

        //  event.preventDefault();
        event.stopPropagation();
        let delta = wheelDistance(event);

        let finalScroll = parseInt(scroller.getValues().top) + parseInt(delta * 100);

        if ( -finalScroll > 0 ) {
          finalScroll = 0;
        }


        if ( Math.abs(finalScroll) > contentElement.offsetHeight - self.get('height') ) {
          finalScroll = (contentElement.offsetHeight - self.get('height'));

        }


        scroller.scrollTo(scroller.getValues().left, finalScroll);


        if ( Math.abs(self.get('lastScrollPosition') - finalScroll) > 50 ) {


          self.set('scrollTop', finalScroll);
          self.set('lastScrollPosition', finalScroll);
        }


      };

      contentElement.addEventListener("mousewheel", self._wheel, { passive: true });
      contentElement.addEventListener("DOMMouseScroll", self._wheel, { passive: true });


    }
    // remove javascript scrolling and set up native scrolling.

    else {

      self.set('scrollBar', false);


      let _raf2 = () => {
        element.scrollTop = self._rafArgs[ 1 ];
        element.scrollLeft = self._rafArgs[ 0 ]
      };

      scroller._callback = function ( scrollLeft, scrollTop /*, zoom*/ ) {

        if ( !self.get('isDestroyed') ) {


          self._rafArgs[ 0 ] = scrollLeft;
          self._rafArgs[ 1 ] = scrollTop;
          self._rafArgs[ 2 ] = 0;
          self._rafArgs[ 3 ] = 0;
          self.get('_AFQ_SCROLL_PANEL').clear();
          //window.requestAnimationFrame(_raf2);
          self.get('_AFQ_SCROLL_PANEL').add(_raf2);
          self._onNativeRender(scrollLeft, scrollTop);
        }

      };


      let mousedown = false;


      self._down = function ( e ) {

        self.get('scroller').scrollTo(element.scrollLeft, element.scrollTop);
        if ( self && scroller && !mousedown ) {
          if ( e.target.tagName.match(/input|textarea|select/i) ) {
            return;
          }
          scroller.doTouchStart([
            {
              pageX: e.pageX,
              pageY: e.pageY
            }
          ], window.performance.now());
          mousedown = true;
        }
      };

      gestures.addEventListener(element, 'down', self._down);


      self._track = function ( e ) {
        e.stopPropagation();
        if ( self && scroller ) {
          if ( !mousedown ) {
            return;
          }
          //e.stopPropagation();
          scroller.doTouchMove([
            {
              pageX: e.pageX,
              pageY: e.pageY
            }
          ], window.performance.now());
        }
      };


      gestures.addEventListener(element, 'track', self._track);


      self._up = function ( e ) {
        e.stopPropagation();
        if ( self && scroller ) {
          if ( !mousedown ) {
            return;
          }
          scroller.doTouchEnd(window.performance.now());
          mousedown = false;
        }

      };
      gestures.addEventListener(document, 'trackend', self._up);

      let contentHeight = contentElement.offsetHeight;// element.getElementsByClassName('scroll-panel-content')[ 0 ].offsetHeight;
      let contentWidth = contentElement.offsetWidth;
      self.set('contentHeight', contentHeight);
      self.set('contentWidth', contentWidth);
      let contentWidthOffset = this.get('_showVerticalScrollbar') ? 15 : 0;
      self.get('scroller').setDimensions(self.get('width'), self.get('height'), contentWidth+contentWidthOffset, contentHeight+15);

      scroller.scrollTo(xLeft, xTop, false);

      self._scroll = function ( e ) {
        self._onNativeRender(e.target.scrollLeft, e.target.scrollTop);

      };
      element.addEventListener('scroll', self._scroll, { passive: true });

    }


  },


  dimensionsDidChange: on('init', Ember.observer("width", "height", 'contentHeight', 'contentWidth','_showVerticalScrollbar', 'manualUpdate', function () {

    once(this, this.processDimensionsDidChange);
  })),

  processDimensionsDidChange() {

    let self = this;
    let element = this.get('element');
    let height = element.offsetHeight;
    let contentElement = this.get('contentElement');
    let contentHeight = contentElement.offsetHeight;
    let contentWidth = contentElement.offsetWidth;

    let contentWidthOffset = this.get('_showVerticalScrollbar') ? 15 : 0;
    self.get('scroller').setDimensions(this.get('width'), this.get('height'), contentWidth+contentWidthOffset, contentHeight+15);

  },

  setupScrollbar: Ember.observer('_verticalScrollbarElement', '_horizontalScrollbarElement', function () {
    let gestures = this.get('gestures');
    let self = this;
    once(() => {
      if ( self.get('scrollBar') ) {
        let contentPanel = this.get('contentElement');
        let vScrollbarKnob = self.get('_verticalScrollbarElement').getElementsByClassName('scroll-knob')[ 0 ];
        let vScrollbar = this.get('_verticalScrollbarElement');
        let hScrollbarKnob = self.get('_horizontalScrollbarElement').getElementsByClassName('scroll-knob')[ 0 ];
        let hScrollbar = this.get('_horizontalScrollbarElement');


        self._vScrollTrack = function ( e ) {
          e.stopPropagation();
          vScrollbar.classList.add('down');
          let actualScale = (vScrollbar.offsetHeight - vScrollbarKnob.offsetHeight) / vScrollbar.offsetHeight;
          let rect = e.target.getBoundingClientRect();
          let offsetY = (((e.clientY - rect.top) / actualScale) - (vScrollbarKnob.offsetHeight / 2)) * (contentPanel.offsetHeight - self.get('height')) / vScrollbar.offsetHeight;
          if ( !isNaN(offsetY) ) {
            self.get('scroller').scrollTo(self.get('scroller').getValues().left, offsetY, false);

          }
        };

        self._hScrollTrack = function ( e ) {
          e.stopPropagation();
          hScrollbar.classList.add('down');
          let actualScale = (hScrollbar.offsetWidth - hScrollbarKnob.offsetWidth) / hScrollbar.offsetWidth;
          let rect = e.target.getBoundingClientRect();
          let offsetX = (((e.clientX - rect.left) / actualScale) - (hScrollbarKnob.offsetWidth / 2)) * (contentPanel.offsetWidth - self.get('width')) / hScrollbar.offsetWidth;
          if ( !isNaN(offsetX) ) {
            self.get('scroller').scrollTo(offsetX, self.get('scroller').getValues().top, false);

          }
        };

        gestures.addEventListener(vScrollbar, 'down', this._vScrollTrack);
        gestures.addEventListener(self.get('_verticalScrollbarElement'), 'track', this._vScrollTrack);
        self._vScrollUp = function () {
          self.get('_verticalScrollbarElement').classList.remove('down');
        };

        gestures.addEventListener(document, 'up', self._vScrollUp);

        gestures.addEventListener(hScrollbar, 'down', this._hScrollTrack);
        gestures.addEventListener(self.get('_horizontalScrollbarElement'), 'track', this._hScrollTrack);
        self._hScrollUp = function () {
          self.get('_horizontalScrollbarElement').classList.remove('down');
        };

        gestures.addEventListener(document, 'up', self._hScrollUp);
      }
    });

  }),

  _scrollTrack: null,
  _scrollUp: null,


  adjustLayout: function ( force ) {

    if ( !this.get('isDestroyed') ) {

      let element = this.get('element');
      let contentElement = this.get('contentElement');
      once(this,function(){
      this.set('height', force ? element.offsetHeight + 1 : element.offsetHeight);
      this.set('width', element.offsetWidth);
      this.set('contentHeight', force ? contentElement.offsetHeight + 1 : contentElement.offsetHeight);
      this.set('contentWidth', contentElement.offsetWidth);
      })
    }

  },
  tearDownListeners() {
    let gestures = this.get('gestures');
    let element = this.get('element');
    let contentElement = this.get('contentElement');
    gestures.removeEventListener(contentElement, 'down', this._down);
    gestures.removeEventListener(contentElement, 'track', this._track);
    contentElement.removeEventListener('mousewheel', self._wheel, { passive: true });
    contentElement.removeEventListener('DOMMouseScroll', self._wheel, { passive: true });
    element.removeEventListener('scroll', self._scroll, { passive: true });
    gestures.removeEventListener(element, 'down', this._down);
    gestures.removeEventListener(element, 'track', this._track);

    gestures.removeEventListener(document, 'trackend', this._up);


  },

  willDestroyElement: function () {


    this._super();
    this.set('updates', null);

    this.tearDownListeners();


  },


  didReceiveAttrs() {
    this._super(...arguments);

    if ( this.get('scroller') ) {
      let scroller = this.get('scroller');
      scroller.options.scrollingX = this.get('scrollingX');
      scroller.options.scrollingY = this.get('scrollingY');
      scroller.options.animating = this.get('animating');
      scroller.options.animationDuration = parseInt(this.get('animationDuration'));
      scroller.options.bouncing = this.get('bouncing');
      scroller.options.locking = this.get('locking');
      scroller.options.paging = this.get('paging');
      scroller.options.snapping = this.get('snapping');
      scroller.options.zooming = this.get('zooming');
      scroller.options.minZoom = this.get('minZoom');
      scroller.options.maxZoom = this.get('maxZoom');
      scroller.setSnapSize(this.get('snapWidth'), parseInt(this.get('snapHeight')));
    }
  },

  didInsertElement: function () {

    this._super();
    let self = this;
    let element = this.get('element');


    this.set('_horizontalScrollbarElement', element.querySelectorAll('.horizontal-scrollbar.' + self.get('_uniqueClassName'))[ 0 ]);
    this.set('_verticalScrollbarElement', element.querySelectorAll('.vertical-scrollbar.' + self.get('_uniqueClassName'))[ 0 ]);
    let scroller = new Scroller(function () {}, {
      scrollingX: self.get('scrollingX'),
      scrollingY: self.get('scrollingY'),
      animating: self.get('animating'),
      animationDuration: self.get('animationDuration'),
      bouncing: self.get('bouncing'),
      locking: self.get('locking'),
      paging: self.get('paging'),
      snapping: self.get('snapping'),
      zooming: self.get('zooming'),
      minZoom: self.get('minZom'),
      maxZoom: self.get('maxZoom')

    });
    scroller.setSnapSize(self.get('snapWidth'), parseInt(self.get('snapHeight')));
    this.set('scroller', scroller);

    this._resize = function ( /*event*/ ) {

      once(self, self.adjustLayout);

    };
    this.get('resize').observe(this.get('element'));
    this.get('resize').observe(this.get('contentElement'));
    element.addEventListener('resize', this._resize);


    this.get('contentElement').addEventListener('resize',this._resize);

    this.useNativeScrollDidChange();
  },
  actions: {}

});

