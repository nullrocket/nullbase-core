import Component from "@ember/component";
import layout from './template';
import { computed } from "@ember/object"
import { inject } from "@ember/service";
export default Component.extend({
  layout,
  classNames:['nb-select-option','item'],
  classNameBindings:['hover'],
  attributeBindings:['tabindex'],
  tabindex:0,
  hover:false,
  gestures:inject(),
  icon:"check-grey",
  hoverIcon:"check-white",
  actions:{
    tap(){
      this.sendAction("onSelectOption");
    }
  },
  x:computed('hover','focused',function(){
    return this.get('hover') || this.get('focused');
  }),
  didInsertElement(){

    let self =this;
    this._tap = function(e){
      e.preventDefault();
      e.stopPropagation();
      self.send("tap");
    }
    this.get('gestures').addEventListener(this.get('element'),'tap',this._tap);

    this._down = function(e){

      e.stopPropagation();

    }
    this.get('element').addEventListener('mouseenter',function(){
      self.set('hover',true);
    });
    this.get('element').addEventListener('mouseleave',function(){
      self.set('hover',false);
    });



    this.get('element').addEventListener('keydown', function ( event ) {
      var key = event.which || event.keyCode;
      // enter key
      if(key === 13){
        event.preventDefault();
        event.stopPropagation();
        self.send('tap');
      }
      // space key
      if(key === 32)
      {
        self.send('tap');
      }
      // up arrow
      if ( key === 38 ) {
        event.preventDefault();
        event.stopPropagation();

        $.tabPrev() ;
        if(!$.contains($(this).parent().get(0),document.activeElement))
        {
          $(':tabbable.item:last',$(this).parent().get(0)).focus();
        }
        //console.log(document.activeElement);

      }
      // down arrow
      if ( key === 40 ) {

        event.preventDefault();
        event.stopPropagation();
        $.tabNext()
        if(!$.contains($(this).parent().get(0),document.activeElement))
        {
          $(':tabbable.item:first',$(this).parent().get(0)).focus();
        }
        //console.log(document.activeElement);
      }


    });



    this.get('gestures').addEventListener(this.get('element'),'down',this._down);
  }
});
