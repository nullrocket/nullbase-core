import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
  layout,
  classNames: [ 'nb-color-select-option', 'item' ],
  classNameBindings: [ 'hover' ,'value'],

  attributeBindings: [ 'tabindex', 'touchAction:touch-action' ],
  touchAction: 'pan',
  tabindex: 0,
  hover: false,
  gestures: Ember.inject.service(),
  icon: "check-white",
  hoverIcon: "check-white",
  actions: {
    tap(){
      this.sendAction("onSelectOption");
    }
  },
  didInsertElement(){
    let self = this;
    this._tap = function ( e ) {
      e.preventDefault();
      e.stopPropagation();
      self.send("tap");
    }
    this.get('gestures').addEventListener(this.get('element'), 'tap', this._tap);

    this._down = function ( e ) {

      //  e.stopPropagation();

    }
    this.$().on('mouseenter', function () {
      self.set('hover', true);
    });
    this.$().on('mouseleave', function () {
      self.set('hover', false);
    });


    this.$().on('keydown', function ( event ) {
      var key = event.which || event.keyCode;
      // enter key
      if ( key === 13 ) {
        event.preventDefault();
        event.stopPropagation();
        self.send('tap');
      }
      // space key
      if ( key === 32 ) {
        self.send('tap');
      }
      // up arrow
      if ( key === 38 ) {
        event.preventDefault();
        event.stopPropagation();

        $.tabPrev();
        if ( !$.contains($(this).parent().get(0), document.activeElement) ) {
          $(':tabbable.item:last', $(this).parent().get(0)).focus();
        }
        //console.log(document.activeElement);

      }
      // down arrow
      if ( key === 40 ) {

        event.preventDefault();
        event.stopPropagation();
        $.tabNext()
        if ( !$.contains($(this).parent().get(0), document.activeElement) ) {
          $(':tabbable.item:first', $(this).parent().get(0)).focus();
        }
        //console.log(document.activeElement);
      }


    });


    this.get('gestures').addEventListener(this.get('element'), 'down', this._down);
  }
});
