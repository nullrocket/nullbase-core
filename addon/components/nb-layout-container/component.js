import Ember from 'ember';
import layout from './template';
import ThemedComponent from 'nullbase-core/mixins/nb-themed-component';



export default Ember.Component.extend(ThemedComponent, {
  tagName:'div',
  classNames:["container-fluid"],
  classNameBindings:["position","vertical-align",'paddingLeft','paddingRight','paddingTop','paddingBottom'],
  position:false,
  verticalAlign: false,
  paddingLeft:Ember.computed('attrs.padding-left',function(){
      if(this.get('attrs.padding-left')) {
        return 'padding-left-' + this.get('attrs.padding-left');
      }
      else{
        return "";
      }
  }),
  paddingRight:Ember.computed('attrs.padding-right',function(){
      if(this.get('attrs.padding-right')) {
        return 'padding-right-' + this.get('attrs.padding-right');
      }
      else{
        return ""
      }
  }),
  paddingTop:Ember.computed('attrs.padding-top',function(){
      if(this.get('attrs.padding-top')) {
        return 'padding-top-' + this.get('attrs.padding-top');
      }
      else{
        return "";
      }
  }),
  paddingBottom:Ember.computed('attrs.padding-bottom',function(){
    if(this.get('attrs.padding-bottom')) {
      return 'padding-bottom-' + this.get('attrs.padding-bottom');
    }
    else {
      return "";
    }
  }),

});