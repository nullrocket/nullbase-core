import Ember from 'ember';
import Scroller from '../../util/scroller/scroller';

import ResizeObserver from '../../util/resize-observer';
import layout from './template';

import first from 'lodash/first';


// TODO: Move this to utils for the theme service
var wheelDistance = function ( evt ) {
  if ( !evt ) evt = event;
  var w = evt.wheelDelta, d = evt.detail;
  if ( d ) {
    if ( w ) { return w / Math.abs(d) / 40 * (d > 0 ? -1 : 1);} // Opera
    else { return d / 10 / 3;}              // Firefox;         TODO: do not /3 for OS X
  }
  else {return -w / 10 / 120; }            // IE/Safari/Chrome TODO: /3 for Chrome OS X
};


export default Ember.Component.extend({
  layout,
  gestures: Ember.inject.service(),
  tagName: 'div',

  unfilteredItems: [],
  classNames: [ '' ],
  classNameBindings: [ 'useNativeScroll:scroll-frame-mobile:scroll-frame' ],
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
  contentProperty: "content",
  lastScrollPosition: 0,
  childViewClass: null,
  autoScrollBar: false,
  dragWithNativeScroll:true,
  /**
   *  'auto','hide','show'
   */
  VerticalScrollBar: 'auto',
  /**
   *  'auto','hide','show'
   */
  horizontalScrollBar: 'auto',
  scrollBar: true,
  verticalScrollBarElement: null,


  attributeBindings: [ 'tabindex' ],
  tabindex: 0,
  touchAction: Ember.computed('useNativeScroll', function () {
    return this.get('useNativeScroll') ? "" : "none";
  }),


  _down: null,
  _track: null,
  _up: null,
  _rafArgs: null,

  updateScrollType: function () {
    let self = this;
    let element = this.get('element');

    let gestures = this.get('gestures');
    if ( this.get('useNativeScroll') === false ) {


      self.set('scrollBar', true);

      Ember.run.scheduleOnce('afterRender', function () {
        let xTop = element.scrollTop;
        let xLeft = element.scrollLeft;
        let contentElement = element.firstChild;
        element.scrollTop = 0;
        element.scrollLeft = 0;

        contentElement.scrollTop = 0;
        contentElement.scrollLeft = 0;
        let scrollKnob = element.getElementsByClassName('scroll-knob')[ 0 ];

        let _raf = () => {
          contentElement.style[ "transform" ] = 'translate3d(' + -(self._rafArgs[ 0 ]) + 'px, ' + -(self._rafArgs[ 1 ]) + 'px, 0)';
          if ( self.get('scrollBar') && scrollKnob ) {
            scrollKnob.style[ "transform" ] = 'translate3d(0px, ' + self._rafArgs[ 2 ] + 'px, 0)';
          }

        };

        let render = function ( scrollLeft, scrollTop /*, zoom*/ ) {
          console.log(self._rafArgs);

          if ( !self.get('isDestroyed') ) {

            //            self.set('scrollTop', scrollTop);
            let contentHeight = contentElement.offsetHeight;
            let viewPortHeight = self.get('height');
            let pos = 0;
            if ( scrollKnob ) {
              pos = Math.max(0, (scrollTop ) / ((contentHeight - viewPortHeight) / (viewPortHeight - scrollKnob.offsetHeight)));
              pos = Math.min(pos, (viewPortHeight - scrollKnob.offsetHeight), viewPortHeight);
            }
            else {
              pos = Math.max(0, (scrollTop ) / ((contentHeight - viewPortHeight) / (viewPortHeight )));
              pos = Math.min(pos, (viewPortHeight), viewPortHeight);
            }

            self._rafArgs[ 0 ] = scrollLeft;
            self._rafArgs[ 1 ] = scrollTop;
            self._rafArgs[ 2 ] = pos;//[contentElement, scrollLeft, scrollTop, scrollKnob, pos, self.get('scrollBar')];
            window.requestAnimationFrame(_raf);
          }

        };
        let scroller = self.get('scroller');

        if ( !self.get('scroller') ) {
          scroller = new Scroller(render, {
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
        }
        else {
          scroller.__callback = render;
        }
        self.set('scroller', scroller);
        self.set('verticalScrollBarElement', element.getElementsByClassName('vertical-scrollbar')[ 0 ]);
        self.set('horizontalScrollBarElement', element.getElementsByClassName('horizontal-scrollbar')[ 0 ]);


        self.adjustLayout();
        scroller.scrollTo(xLeft, xTop);

        let mousedown = false;


        self._down = function ( e ) {

          //    e.preventDefault();
          //    e.preventBubble();


          //    e.stopPropagation();

          if ( self && scroller && !mousedown ) {
            if ( e.target.tagName.match(/input|textarea|select/i) ) {
              return;
            }
            //e.stopImmediatePropagation();
            scroller.doTouchStart([
              {
                pageX: e.pageX,
                pageY: e.pageY
              }
            ], window.performance.now());
            mousedown = true;
          }
        };

        gestures.addEventListener(contentElement, 'down', self._down);


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

            //    mousedown = true;
          }
        };
        gestures.addEventListener(contentElement, 'track', self._track);


        self._up = function ( e ) {

          e.stopPropagation();


          if ( self && scroller ) {
            if ( !mousedown ) {
              return;
            }
            //       e.stopImmediatePropagation();
            scroller.doTouchEnd(window.performance.now());

            mousedown = false;
          }

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
      });

    }
    // remove javascript scrolling and set up native scrolling.

    else {
      let contentElement = element.firstChild;
      this.tearDownListeners();

      self.set('scrollBar', false);
      if ( this.get('scroller') ) {
        delete   self.get('scroller')._callback;
        self.set('scroller', null);
      }


      Ember.run.scheduleOnce('afterRender', function () {
        let xTop = element.scrollTop;
        let xLeft = element.scrollLeft;
        let contentElement = element.firstChild;
        element.scrollTop = 0;
        element.scrollLeft = 0;

        contentElement.scrollTop = 0;
        contentElement.scrollLeft = 0;
        let scrollKnob = element.getElementsByClassName('scroll-knob')[ 0 ];

        let _raf2 = () => {
          element.scrollTop = self._rafArgs[1];
          element.scrollLeft = self._rafArgs[0]
        };

        let render = function ( scrollLeft, scrollTop /*, zoom*/ ) {


          if ( !self.get('isDestroyed') ) {


            self._rafArgs[ 0 ] = scrollLeft;
            self._rafArgs[ 1 ] = scrollTop;
            self._rafArgs[ 2 ] = 0;//[contentElement, scrollLeft, scrollTop, scrollKnob, pos, self.get('scrollBar')];
            window.requestAnimationFrame(_raf2);
          }

        };
        let scroller = self.get('scroller');

        if ( !self.get('scroller') ) {
          scroller = new Scroller(render, {
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
        }
        else {
          scroller.__callback = render;
        }
        self.set('scroller', scroller);
        self.set('verticalScrollBarElement', element.getElementsByClassName('vertical-scrollbar')[ 0 ]);
        self.set('horizontalScrollBarElement', element.getElementsByClassName('horizontal-scrollbar')[ 0 ]);


        self.adjustLayout();
        scroller.scrollTo(xLeft, xTop);

        let mousedown = false;


        self._down = function ( e ) {

          //    e.preventDefault();
          //    e.preventBubble();


          //    e.stopPropagation();

          if ( self && scroller && !mousedown ) {
            if ( e.target.tagName.match(/input|textarea|select/i) ) {
              return;
            }
            //e.stopImmediatePropagation();
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

            //    mousedown = true;
          }
        };
        gestures.addEventListener(element, 'track', self._track);


        self._up = function ( e ) {

          e.stopPropagation();


          if ( self && scroller ) {
            if ( !mousedown ) {
              return;
            }
            //       e.stopImmediatePropagation();
            scroller.doTouchEnd(window.performance.now());

            mousedown = false;
          }

        };
        gestures.addEventListener(document, 'trackend', self._up);


        let contentHeight = element.getElementsByClassName('scroll-panel-content')[ 0 ].offsetHeight;
        let contentWidth = element.getElementsByClassName('scroll-panel-content')[ 0 ].offsetWidth;

        self.get('scroller').setDimensions(self.get('width'), self.get('height'), contentWidth, contentHeight);
      });











      Ember.run.scheduleOnce('afterRender', () => {
        let elementC = element.getElementsByClassName('scroll-panel-content')[ 0 ];
        //  elementC.removeEventListener("wheel", this._wheel);
        elementC.style[ "transform" ] = 'translate3d(0px, 0px, 0)';
      });

    }


  },
  useNativeScrollObserver: Ember.observer('useNativeScroll', function () {
    if ( this.get('element') ) {
      Ember.run.scheduleOnce('afterRender', () => {
        this.updateScrollType();
      })

    }
  })/*.on('init')*/,

  init() {
    this._super(...arguments);
    this.set('_rafArgs', new Array(3));
  },
  updateItems: Ember.observer("width", "height", 'contentHeight', 'contentWidth', 'manualUpdate', function () {
    let self = this;
    let element = this.get('element');
    let height = element.offsetHeight;
    let contentHeight = element.getElementsByClassName('scroll-panel-content')[ 0 ].offsetHeight;
    let contentWidth = element.getElementsByClassName('scroll-panel-content')[ 0 ].offsetWidth;
    if ( self.get('scrollBar') ) {
      if ( height >= contentHeight ) {
        element.classList.add('hide-scrollbars');
      }
      else {
        element.classList.remove('hide-scrollbars');
      }
    }
    if ( self.get('scroller') ) {
      self.get('scroller').setDimensions(this.get('width'), this.get('height'), contentWidth, contentHeight);
    }

  }),


  setupScrollBar: Ember.observer('verticalScrollBarElement', 'horizontalScrollBarElement', function () {
    let gestures = this.get('gestures');
    let self = this;

    if ( self.get('scrollBar') && self.get("verticalScrollBarElement") ) {

      let scrollBarKnob = self.get('verticalScrollBarElement').getElementsByClassName('scroll-knob')[ 0 ];
      let contentPanel = this.get('element').getElementsByClassName('scroll-panel-content')[ 0 ];
      let scrollBar = this.get('verticalScrollBarElement');


      self._scrollTrack = function ( e ) {
        scrollBar.classList.add('down');
        let actualScale = (scrollBar.offsetHeight - scrollBarKnob.offsetHeight) / scrollBar.offsetHeight;
        let rect = e.target.getBoundingClientRect();
        let offsetY = (((e.clientY - rect.top) / actualScale) - (scrollBarKnob.offsetHeight / 2)) * (contentPanel.offsetHeight - self.get('height')) / scrollBar.offsetHeight;
        if ( !isNaN(offsetY) ) {
          self.get('scroller').scrollTo(0, offsetY, false);

        }
      };
      gestures.addEventListener(scrollBar, 'down', this._scrollTrack);
      gestures.addEventListener(self.get('verticalScrollBarElement'), 'track', self._scrollTrack);
      self._scrollUp = function () {

        if ( self.get('verticalScrollBarElement') ) {
          self.get('verticalScrollBarElement').classList.remove('down');
        }
      };
      gestures.addEventListener(document, 'up', self._scrollUp);

    }


  }),

  _scrollTrack: null,
  _scrollUp: null,


  adjustLayout: function ( force ) {

    if ( !this.get('isDestroyed') ) {
      let element = this.get('element');
      let contentElement = element.getElementsByClassName('scroll-panel-content')[ 0 ];
      this.beginPropertyChanges();
      this.set('height', force ? element.offsetHeight + 1 : element.offsetHeight);
      this.set('width', element.offsetWidth);
      this.set('contentHeight', force ? contentElement.offsetHeight + 1 : contentElement.offsetHeight);
      this.set('contentWidth', contentElement.offsetWidth);
      this.endPropertyChanges();
    }

  },
  tearDownListeners(){
    let gestures = this.get('gestures');
    let element = this.get('element');
    let contentElement = element.getElementsByClassName('scroll-panel-content')[ 0 ];
    gestures.removeEventListener(contentElement, 'down', this._down);
    gestures.removeEventListener(contentElement, 'track', this._track);
    contentElement.removeEventListener('mousewheel', self._wheel, { passive: true });
    contentElement.removeEventListener('DOMMouseScroll', self._wheel, { passive: true });

    gestures.removeEventListener(this.get('element'), 'down', this._down);
    gestures.removeEventListener(this.get('element'), 'track', this._track);

    gestures.removeEventListener(document, 'trackend', this._up);


  },

  willDestroyElement: function () {


    this._super();
    this.set('updates', null);

  this.tearDownListeners();


  },


  scroller: null,
  adjustIntervalHandle: 0,
  _resizeListener: null,
  _lastSelected: null,
  didReceiveAttrs() {
    this._super(...arguments);
    if ( this.get('scroller') ) {

      let scroller = this.get('scroller');
      scroller.options.scrollingX = this.get('scrollingX');
      scroller.options.scrollingY = this.get('scrollingY');
      scroller.options.animating = this.get('animating');
      scroller.options.animationDuration = this.get('animationDuration');
      scroller.options.bouncing = this.get('bouncing');
      scroller.options.locking = this.get('locking');
      scroller.options.paging = this.get('paging');
      scroller.options.snapping = this.get('snapping');
      scroller.options.zooming = this.get('zooming');
      scroller.options.minZoom = this.get('minZoom');
      scroller.options.maxZoom = this.get('maxZoom');
      scroller.setSnapSize(this.get('snapWidth'), this.get('snapHeight'));


    }
  },
  didInsertElement: function () {

    this._super();
    let self = this;
    let element = this.get('element');

    const ro = new ResizeObserver(( entries, observer ) => {
      self.adjustLayout();
    });

    ro.observe(element.getElementsByClassName('scroll-panel-content')[ 0 ]);
    ro.observe(element);


    this.updateScrollType();
    Ember.run.scheduleOnce('afterRender', function () {
      self.set('manualUpdate', window.performance.now());
    })


    /* $(this.get('element')).on('focusin', function ( e ) {
       if ( !self.get('useNativeScroll') ) {
         $(self.get('element')).scrollTop(0);
         $('.scroll-panel-content', self.get('element')).scrollTop(0);
         var targetRect = e.target.getBoundingClientRect();
         var thisRect = self.get('element').getBoundingClientRect();

         if ( targetRect.bottom + 20 > thisRect.bottom ) {

           self.get('scroller').scrollTo(0, targetRect.bottom - thisRect.bottom + self.get('scroller').getValues().top + 20);
         }

         if ( targetRect.top - 20 < thisRect.top ) {

           self.get('scroller').scrollTo(0, (targetRect.top + self.get('scroller').getValues().top) - thisRect.top - 20);
         }
       }


     }); */

  },
  actions: {}

});

