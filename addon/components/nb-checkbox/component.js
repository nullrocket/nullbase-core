/*globals $:false */
import Ember from 'ember';
import layout from './template';
import ThemedComponent from 'nullbase-core/mixins/nb-themed-component';
import is from 'nullbase-core/util/is';

export default Ember.Component.extend(ThemedComponent, {
  layout,
  gestures: Ember.inject.service(),
  tagName: "div",
  classNames: [ 'nb-checkbox' ],
  label: "",
  classNameBindings: [ 'disabled:disabled', 'type', 'labelPosition', 'label::no-label' ],
  attributeBindings: [ 'touchAction:touch-action', 'disabled:disabled', "title:title", 'canFocus:tabindex' ],
  tabindex: 0,
  canFocus: Ember.computed('tabindex', 'disabled', function () {
    return this.get('disabled') ? false : this.get('tabindex');
  }),
  touchAction: 'none',
  labelPosition: 'right',
  disabled: false,
  useNativeClick: false,
  ink: true,
  icon: Ember.observer('checked', function () {
    var self = this;
    if ( this.get('checked') ) {
      requestAnimationFrame(function () {
        if(self && !self.get('isDestroying') && !self.get('isDestroyed') && self.get('element').getElementsByClassName('button-icon')[0]) {
          self.get('element').getElementsByClassName('button-icon')[0].classList.add('animate');
        }
      });
    }
    else {
      requestAnimationFrame(function () {
        if(self && !self.get('isDestroying') && !self.get('isDestroyed') && self.get('element').getElementsByClassName('button-icon')[0]) {
          self.get('element').getElementsByClassName('button-icon')[0].classList.remove('animate');
        }
      });
    }

  }),
  checkedIcon: "checkbox-marked-grey",
  uncheckedIcon: "checkbox-blank-outline-grey",
  maybeCheckedIcon:"minus-box-grey",
  _currentIcon: Ember.computed('uncheckedIcon', 'checkedIcon', 'maybeCheckedIcon','checked', function() {
    return this.get('checked') ? this.get('checkedIcon') : this.get('checked') != null?  this.get('uncheckedIcon') : this.get('maybeCheckedIcon');
  }),


  init(){
    this._super(...arguments);
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
 //   let $element = this.$();
    let removeEventListener = this.get('gestures').removeEventListener;
    removeEventListener(element, 'tap', this._tap);
    removeEventListener(element, 'down', this._down);
    removeEventListener(element, 'up', this._up);
  //  $element.off('mouseover');
 //   $element.off('mouseout');
 //   $element.off('keydown', this._keydown);
 //   $element.off('keyup', this._keyup);
    this._super(...arguments);
  },


  _themeProperties: [
    'attrs.pressed-background-color',
    'attrs.focused-background-color',
    'attrs.pressed-background-color',
    'attrs.focused-background-color',
    'attrs.focused-text-color',
    'attrs.pressed-text-color',
    'attrs.background-color',
    'attrs.text-color'
  ],
  didInsertElement(){
    this._super(...arguments);
    let gestures = this.get('gestures');
    let self = this;

    let element = this.get('element');
    let $ink = element.getElementsByClassName('ink')[0];


    /**
     *
     * @param event
     * @private
     */
    this._tap = function ( event ) {
      if ( !self.get('disabled') && (is(event.target,'label') || is(event.target,'.inner') || is(event.target,'.button-icon')) ) {


        self.send("tap", event);
      }
      $ink.classList.remove('animate');
    };


    /**
     *
     * @private
     */
    this._bodyUp = function ( /*event*/ ) {
      gestures.removeEventListener(document, 'up', self._bodyUp, true);
      if ( self.get('ink') ) {
        $ink.classList.remove('animate');
      }
    };

    /**
     *
     * @param event
     * @private
     */
    this._down = function ( event ) {
      if ( !self.get('disabled') && (is(event.target,'label') || is(event.target,'.inner') || is(event.target,'.button-icon')) ) {
        element.classList.add('pressed');
        if ( self.get('ink') ) {

          $ink.classList.add('inkDefaultColor');
          $ink.classList.add('animate');
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
      if ( !self.get('disabled') ) {
        element.classList.remove('pressed');
        self.send("up", event);
      }

    };

    element.addEventListener('mouseover', function () {
      if ( !self.get('disabled') ) {

        element.classList.add('hover');

      }
    });

    element.addEventListener('mouseout', function () {
      if ( !self.get('disabled') ) {
        element.classList.remove('hover');
      }
    });


    if ( self.get('useNativeClick') ) {
      element.addEventListener('click', function ( event ) {
               if ( !self.get('disabled') ) {
          event.preventDefault();
          event.stopPropagation();
          self.send('tap', event);
        }
      });
    }
    else {
      gestures.addEventListener(element, 'tap', this._tap);
    }
    this.keyDown = false;
    this._keydown = function ( event ) {
      if ( (event.keyCode === 32 || event.keyCode === 13) && self.keyDown !== true ) {
        self.keyDown = true;
        if ( !self.get('disabled') ) {
          element.classList.add('pressed');

          if ( self.get('ink') ) {
            $ink.classList.add('inkDefaultColor');
            $ink.classList.add('animate');
          }
          $(document).on('keyup', self._bodyUp);
          self.send("down", event);
        }
      }
    };
    this._keyup = function ( event ) {
      if ( (event.keyCode === 32 || event.keyCode === 13) && self.keyDown === true ) {
        self.keyDown = false;
        self.send('tap', event);
      }
    };


    element.addEventListener('keydown', this._keydown);
    element.addEventListener('keyup', this._keyup);


    gestures.addEventListener(element, 'down', this._down);
    gestures.addEventListener(element, 'up', this._up);
  }
});
