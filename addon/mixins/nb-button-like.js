import Mixin from '@ember/object/mixin';
import { computed } from "@ember/object"
import { inject as service } from '@ember/service';
import ThemedComponent from 'nullbase-core/mixins/nb-themed-component';
import {once} from "@ember/runloop";

export default Mixin.create(ThemedComponent, {
  gestures: service(),
  tagName: "button",
  classNames: [ 'nb-button-like' ],
  classNameBindings: [ 'disabled:disabled', 'type', 'size', "pressed:pressed", "hover:hover" ,"focus:focus"],
  pressed: false,
  focus:false,
  tabindex:0,
  size: '',
  attributeBindings: [ 'touchAction:touch-action', 'disabled:disabled', "title:title","_tabIndex:tabindex" ],
  _tabIndex: computed('tabindex', 'disabled', function () {
    return this.get('disabled') ? false : this.get('tabindex');
  }),
  canFocus: computed('tabindex', 'disabled', function () {
    return this.get('disabled') ? false : true;//this.get('tabindex');
  }),
  showFocus:false,
  touchAction: 'none',
  disabled: false,
  useNativeClick: false,

  type: "flat-text",//"flat-text" , "raised-text", "flat-icon", "raised-icon"
  icon: "",
  beforeDown(){},
  beforeTap(){},
  keyPress( e ) {
    let key = e.which || e.keyCode;
    if ( key === 13 || key === 32 ) {
      e.stopPropagation();
      e.preventDefault();
      this.send("tap", e);
    }
  },
  keyDown( e ) {
    let key = e.which || e.keyCode;
    let self = this;
    if ( key === 13 || key === 32 ) {
      e.stopPropagation();
      if ( !self.get('disabled') ) {
        self.set('pressed', true);
        this.beforeKeyDown(event);
        document.addEventListener('keyup', self._bodyKeyUp, true);
        self.send("down", e);
      }
    }
  },
  keyUp( e ) {
    let key = e.which || e.keyCode;
    if ( key === 13 || key === 32 ) {
      e.stopPropagation();
      let self = this;
      if ( !self.get('disabled') ) {
        self.set('pressed', false);
        self.beforeKeyUp(event);
        self.send("up", e);
      }
    }
  },
  actions: {
    tap() {
      this.sendAction('attrs.on-tap', ...arguments);
    },
    down() {
      this.sendAction('attrs.on-down', ...arguments);
    },
    up() {
      this.sendAction('attrs.on-up', ...arguments);
    }
  },


  willDestroyElement() {
    let element = this.get('element');
    let removeEventListener = this.get('gestures').removeEventListener;
    document.removeEventListener('keyup', this._bodyKeyUp, true);
    removeEventListener(document, 'up', this._bodyUp, true);
    removeEventListener(element, 'tap', this._tap);
    removeEventListener(element, 'down', this._down);
    removeEventListener(element, 'up', this._up);
    element.removeEventListener('mouseover', this._mouseover);
    element.removeEventListener('mouseout', this._mouseout);
    element.removeEventListener('click', this._click);
    element.removeEventListener('touchstart', this._touchstart);
    removeEventListener(element,'trackend',this._trackend);
    removeEventListener(element,'trackstart',this._trackstart);
    this._super(...arguments);
  },

  /*
   * event handlers
   */
  _tap: null,
  _down: null,
  _up: null,
  _bodyUp: null,
  _touchstart: null,
  _mouseout: null,
  _mouseover: null,
  _tracking:true,
  bleg(){},

  didInsertElement() {
    this._super(...arguments);
    let gestures = this.get('gestures');
    let self = this;

    let element = this.get('element');

    /**
     *
     * @param event
     * @private
     */
    this._tap = function ( event ) {

      event.preventDefault();
      event.stopPropagation();
      if ( !self.get('disabled') ) {
        if(!self.get('_tracking')) {

          self.beforeTap(event);
          self.send("tap", event);
        }
        self.set('_tracking',false);
      }
    };


    /**
     *
     * @private
     */
    this._bodyUp = function ( /*event*/ ) {
      gestures.removeEventListener(document, 'up', self._bodyUp, true);
      self.set('_tracking',false);
      self.set('pressed', false);
      self._onBodyUp();
    };
    this._bodyKeyUp = function ( event ) {

      document.removeEventListener('keyup', self._bodyKeyUp, true);
      self.set('pressed', false);
      self._onBodyKeyUp(event);

    };
    /**
     *
     * @param event
     * @private
     */
    this._down = function ( event ) {
      element.focus();
    //  event.stopPropagation();
      event.preventDefault();

      if ( !self.get('disabled') ) {


          if(self.get('showFocus'))
          {

            self.set('pressed',true);
          }
          else {
            self.set('pressed', false);
          }


        self.beforeDown(event);
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
        self.bleg();
        self.set('pressed', false);
        self.send("up", event);
      }
    };

    this._mouseover = function () {
      if ( !self.get('disabled') ) {
        self.set('hover', true);
      }
    };

    element.addEventListener('mouseover', this._mouseover);


    this._mouseout = function () {
      if ( !self.get('disabled') ) {
        self.set('hover', false);
      }
    };

    element.addEventListener('mouseout', this._mouseout);



    this._touchstart = function ( event ) {
      if ( !self.get('disabled')  ) {
        event.preventDefault();
        event.stopPropagation();
        self.send('tap', event);
      }
    };
    this._click = function ( event ) {
      if ( !self.get('disabled') ) {
        event.preventDefault();
        event.stopPropagation();
        self.send('tap', event);
      }
    };

    if ( self.get('useNativeClick') ) {

      element.addEventListener('click', this._click);
    //  element.addEventListener('touchstart', this._touchstart);
    }
    else {
      gestures.addEventListener(element, 'tap', this._tap);
    }

    element.addEventListener('focusin',function(){
      if(self.get('canFocus') && self.get('showFocus') ) {
        self.set('focus', true);
      }
    });

    element.addEventListener('focusout',function(){

        self.set('focus', false);

    });

    element.dataset.wiggle = 200;
    this._trackend = function(e){

      self.set('_tracking',true);

    }
    gestures.addEventListener(element,'trackend',this._trackstart);
    this._trackstart=function(e){

      self.set('_tracking',true);

    };
    gestures.addEventListener(element,'trackstart',this._trackstart);

    gestures.addEventListener(element, 'down', this._down);
    gestures.addEventListener(element, 'up', this._up);
  }
});
