import Ember from 'ember';
import layout from './template';
import ThemedComponent from 'nullbase-core/mixins/nb-themed-component';


function offset( elem ) {

  var docElem, win, rect, doc;
  rect = elem.getBoundingClientRect();

  // Make sure element is not hidden (display: none) or disconnected
  if ( rect.width || rect.height || elem.getClientRects().length ) {
    doc = elem.ownerDocument;
    win = doc.defaultView;
    docElem = doc.documentElement;

    return {
      top: rect.top + win.pageYOffset - docElem.clientTop,
      left: rect.left + win.pageXOffset - docElem.clientLeft
    };
  }
}
export default Ember.Component.extend(ThemedComponent, {
  layout,
  gestures: Ember.inject.service(),
  tagName: "button",
  classNames: [ 'nb-button' ],
  classNameBindings: [ 'disabled:disabled', 'type', 'size', "pressed:pressed" ],
  pressed: false,
  elevation: Ember.computed('pressed',
    function () {
      if ( (this.get('attrs.type') === 'raised-text' || this.get('attrs.type') === 'raised-icon') ) {
        if ( this.get('pressed') ) {
          return 'elevation-8dp';
        }
        else {
          return 'elevation-2dp'
        }

      }
      else {
        return '';
      }
    }),

  size: '',
  attributeBindings: [ 'touchAction:touch-action', 'disabled:disabled', "title:title" ],
  touchAction: 'none',
  disabled: false,
  useNativeClick: false,
  ink: true,
  type: "flat-text",//"flat-text" , "raised-text", "flat-icon", "raised-icon"
  icon: "",

  keyPress( e ) {
    var key = e.which || e.keyCode;
    if ( key === 13 || key === 32 ) {
      e.stopPropagation();
      e.preventDefault();
      this.send("tap", e);
    }
  },
  keyDown( e ) {
    var key = e.which || e.keyCode;
    var self = this;


    if ( key === 13 || key === 32 ) {
      e.stopPropagation();


      let element = this.get('element');
      let ink = element.getElementsByClassName('ink')[0];
      let gestures = this.get('gestures');
      if ( !self.get('disabled') ) {

        self.set('pressed', true);

        let inner=  element.getElementsByClassName('inner')[0];


        let display = inner.css("display");
        if ( display === 'inline' || display === 'inline-block' ) {
          $inner.css({ display: 'inline-block' });
        }
        else {
          $inner.css({ display: 'block' });
        }
        if ( !self.get('disabled') && self.get('ink') ) {
          $ink.addClass('inkColor');
        }

        if ( self.get('ink') ) {
          if ( !$ink.width() && !$ink.height() ) {
            let max = Math.max($inner.outerWidth(), $inner.outerHeight());
            $ink.css({
              width: max + 'px',
              height: max + 'px'
            });
          }

          let x = 0;
          let y = 0;
          $ink.css({
            top: y + 'px',
            left: x + 'px'
          });


          $ink.addClass('animate');

        }

        document.addEventListener('keyup', self._bodyKeyUp, true);
        self.send("down", e);
      }
    }
  },
  keyUp( e ) {
    var key = e.which || e.keyCode;
    if ( key === 13 || key === 32 ) {
      e.stopPropagation();
      let element = this.get('element');
      let ink = element.getElementsByClassName('ink')[0];
      let self = this;
      if ( !self.get('disabled') ) {
        element.classList.remove('pressed');
        self.set('pressed', false);
        if ( self.get('ink') ) {
          ink.classList.remove('animate');
        }
        self.send("up", e);
      }
    }
  },
  actions: {
    tap(){
      this.sendAction('attrs.on-tap', ...arguments);
    },
    down(){
      this.sendAction('attrs.on-down', ...arguments);
    },
    up(){
      this.sendAction('attrs.on-up', ...arguments);
    }
  },


  willDestroyElement(){
    let element = this.get('element');

    let removeEventListener = this.get('gestures').removeEventListener;
    document.removeEventListener('keyup', this._bodyKeyUp, true);
    removeEventListener(document, 'up', this._bodyUp, true);
    removeEventListener(element, 'tap', this._tap);
    removeEventListener(element, 'down', this._down);
    removeEventListener(element, 'up', this._up);
    element.removeEventListener('mouseover',this._mouseover);
    element.removeEventListener('mouseout',this._mouseout);
    element.removeEventListener('click',this._click);
    element.removeEventListener('touchstart',this._touchstart);
    this._super(...arguments);
  },

  _tap: null,
  _down: null,
  _up: null,
  _bodyUp: null,
  _touchstart: null,
  _mouseout:null,
  _mouseover:null,
  _insertedStyles: [],
  _themeProperties: [
    'attrs.pressed-background-color',
    'attrs.focused-background-color',
    'attrs.pressed-background-color',
    'attrs.focused-background-color',
    'attrs.focused-text-color',
    'attrs.pressed-text-color',
    'attrs.background-color',
    'attrs.ink-color',
    'attrs.text-color'
  ],
  didInsertElement(){
    this._super(...arguments);
    let gestures = this.get('gestures');
    let self = this;

    let element = this.get('element');
    let ink = element.getElementsByClassName('ink')[0];
     /**
     *
     * @param event
     * @private
     */
    this._tap = function ( event ) {
      event.preventDefault();
      event.stopPropagation();
      if ( !self.get('disabled') ) {
        ink.classList.remove('animate');
        self.send("tap", event);
      }
    };


    /**
     *
     * @private
     */
    this._bodyUp = function ( /*event*/ ) {
      gestures.removeEventListener(document, 'up', self._bodyUp, true);
      element.classList.remove('pressed');
      self.set('pressed', false);
      if ( self.get('ink') ) {
        ink.classList.remove('animate');
      }
    };
    this._bodyKeyUp = function ( /*event*/ ) {
      document.removeEventListener('keyup', self._bodyKeyUp, true);
      element.classList.remove('pressed');
      self.set('pressed', false);
      if ( self.get('ink') ) {
        ink.classList.remove('animate');
      }
    };
    /**
     *
     * @param event
     * @private
     */
    this._down = function ( event ) {

      event.preventDefault();
      element.focus();
      if ( !self.get('disabled') ) {

        self.set('pressed', true);


        let inner = element.getElementsByClassName('inner')[0];


        let display = inner.style.display;
        if ( display === 'inline' || display === 'inline-block' ) {
          inner.style.display = 'inline-block' ;
        }
        else {
          inner.style.display = 'block' ;

        }
        if ( !self.get('disabled') && self.get('ink') ) {
          ink.classList.add('inkColor');
        }

        if ( self.get('ink') ) {
          if ( !ink.offsetWidth && !ink.offsetHeight ) {
            let max = Math.max(inner.offsetWidth, inner.offsetHeight);
            ink.style.width = max + 'px';
            ink.style.height =  max + 'px';
          }

          let x = event.pageX - offset(inner).left - ink.offsetWidth / 2;
          let y = event.pageY - offset(inner).top - ink.offsetHeight / 2;
          ink.style.top = y+'px';
          ink.style.left = x+'px';


          ink.classList.add('animate');

        }
        gestures.addEventListener(document, 'up', self._bodyUp, true);

        self.send("down", event);
      }
    };


    /**
     *
     * @param event
     * @private
     */
    this._up = function ( event ) {
      event.preventDefault();
      if ( !self.get('disabled') ) {
        element.classList.remove('pressed');
        self.set('pressed', false);
        self.send("up", event);
      }
    };

    this._mouseover =  function () {
      if ( !self.get('disabled') ) {
        element.classList.add('hover');
      }
    };

    element.addEventListener('mouseover', this._mouseover);


    this._mouseout =  function () {
      if ( !self.get('disabled') ) {
        element.classList.remove('hover');
      }
    };

    element.addEventListener('mouseout',this._mouseout);

    this._click =  function ( event ) {
      if ( !self.get('disabled') ) {
        event.preventDefault();
        event.stopPropagation();
        self.send('tap', event);
      }
    };
    this._touchstart = function ( event ) {
      if ( !self.get('disabled') ) {
        event.preventDefault();
        event.stopPropagation();
        self.send('tap', event);
      }
    };

    if ( self.get('useNativeClick') ) {
      element.addEventListener('click',this._click);
      element.addEventListener('touchstart', this._touchstart);
    }
    else {
      gestures.addEventListener(element, 'tap', this._tap);
    }

    gestures.addEventListener(element, 'down', this._down);
    gestures.addEventListener(element, 'up', this._up);
  }
});
