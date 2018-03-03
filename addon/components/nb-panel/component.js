import { computed } from '@ember/object';
import Component from '@ember/component';
import layout from './template';
import ThemedComponent from 'nullbase-core/mixins/nb-themed-component';



export default Component.extend(ThemedComponent, {
  tagName:'div',
  classNames:["nb-panel","container-fluid"],
  classNameBindings:["paddingLeft","paddingRight","paddingBottom","paddingTop"],
  layout,


  paddingLeft:computed('attrs.padding-left',function(){
    if(this.get('attrs.padding-left')) {
      return 'padding-left-' + this.get('attrs.padding-left');
    }
    else{
      return "";
    }
  }),
  paddingRight:computed('attrs.padding-right',function(){
    if(this.get('attrs.padding-right')) {
      return 'padding-right-' + this.get('attrs.padding-right');
    }
    else{
      return ""
    }
  }),
  paddingTop:computed('attrs.padding-top',function(){
    if(this.get('attrs.padding-top')) {
      return 'padding-top-' + this.get('attrs.padding-top');
    }
    else{
      return "";
    }
  }),
  paddingBottom:computed('attrs.padding-bottom',function(){
    if(this.get('attrs.padding-bottom')) {
      return 'padding-bottom-' + this.get('attrs.padding-bottom');
    }
    else {
      return "";
    }
  }),

});