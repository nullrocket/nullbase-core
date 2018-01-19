import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
  layout,
  classNames: [ 'nb-color-select-drop-down', 'elevation-2dp' ],
  attributeBindings: [ 'tabindex' ],
  gestures:Ember.inject.service(),
  tabindex: '-1',
  actions:{
    closeDropDown(){

      this.sendAction('closeDropDown');
    }
  },
  didInsertElement(){
    var self = this;
    this.$().on('keydown', function ( evt ) {
      var key = evt.which || evt.keyCode;

      if ( key !== 9 && key !== 27 && key !== 38 && key !== 40 ) {

        evt.stopPropagation();
      }
      if ( key === 27 ) {
        //  self.get('element').focus();
        //  self.send('remove');
        self.send("closeDropDown");
      }


      // up arrow
      if ( key === 38 ) {
        evt.preventDefault();
        evt.stopPropagation();


        $(':tabbable.item:last', $(this).parent().get(0)).focus();

      }
      // down arrow
      if ( key === 40 ) {
        $(':tabbable.item:first', $(this).parent().get(0)).focus();

      }

    });
    this._down = function(e){

      e.stopPropagation();

    }
    this.get('gestures').addEventListener(this.get('element'),'down',this._down);
  }
});
