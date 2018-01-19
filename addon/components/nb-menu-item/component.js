import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
  layout,
  gestures: Ember.inject.service(),
  classNames: [ 'nb-menu-item', 'item' ],

  classNameBindings: [ 'hover', 'focused',"disabled" ],
  disabled:false,
  attributeBindings: [ 'tabindex', "title" ],
  tabindex: 0,
  hover: false,
  focused: false,
  icon: "",
  useNativeClick:false,
  actions: {
    tap(){
      if(!this.get('disabled')) {
        this.parentView.send('remove');
        this.sendAction("attrs.on-tap");
      }
    }
  },
  willDestroyElement(){
    let gestures = this.get('gestures');
    gestures.removeEventListener(this.get('element'), "down", this._down);
    gestures.removeEventListener(this.get('element'), "tap", this._tap);
    this.$().off("mousenter");
    this.$().off("mouseleave");
    this.$().off("focusin");
    this.$().off("focusout");

  },
  didInsertElement(){
    let self = this;
    let gestures = this.get("gestures");
    let element = this.get('element');
    this._down = function ( inEvent ) {
      inEvent.preventDefault();
      inEvent.stopPropagation();
      //    $element.addClass('hover');

    };

    this.get("gestures").addEventListener(this.get("element"), 'down', this._down);
    this.$().on('mouseenter', function () {
      self.set('hover', true);
    });
    this.$().on('mouseleave', function () {
      self.set('hover', false);
    });
    this._tap = function ( event ) {

        event.preventDefault();
        event.stopPropagation();
        self.send('tap');

    };
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
      element.addEventListener('touchend', this._touchstart);
    }
    else {

      gestures.addEventListener(element, 'tap', this._tap);

    }





    this.$().on('focusin', function () {
      self.set('focused', true);
    });
    this.$().on('focusout', function () {
      self.set('focused', false)
    });


    this.$().on('keydown', function ( evt ) {
      var key = evt.which || evt.keyCode;
      // enter key
      if(key === 13){
        self.send('tap');
      }
      // space key
      if(key === 32)
      {
        self.send('tap');
      }
      // up arrow
      if ( key === 38 ) {
        evt.preventDefault();
        evt.stopPropagation();

        $.tabPrev() ;
        if(!$.contains($(this).parent().get(0),document.activeElement))
        {
          $(':tabbable.item:last',$(this).parent().get(0)).focus();
        }


      }
      // down arrow
      if ( key === 40 ) {

        evt.preventDefault();
        evt.stopPropagation();
        $.tabNext()
        if(!$.contains($(this).parent().get(0),document.activeElement))
        {
          $(':tabbable.item:first',$(this).parent().get(0)).focus();
        }

      }


    });


  }
});
