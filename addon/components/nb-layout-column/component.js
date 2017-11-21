import Ember from 'ember';
import layout from './template';
import ThemedComponent from 'nullbase-core/mixins/nb-themed-component';



export default Ember.Component.extend(ThemedComponent, {
  tagName:'div',
  classNames:["col"],
  classNameBindings:["xs","md","sm","lg","paddingLeft","paddingRight","paddingBottom","paddingTop"],
  layout,
  xs:Ember.computed('attrs.col-xs',function(){
    if(this.get('attrs.col-xs')) {
      return 'col-xs-' + this.get('attrs.col-xs');
    }
    else{
      return "";
    }
  }),
  md:Ember.computed('attrs.col-md',function(){
    if(this.get('attrs.col-md')) {
      return 'col-md-' + this.get('attrs.col-md');
    }
    else{
      return "";
    }
  }),
  sm:Ember.computed('attrs.col-sm',function(){
    if(this.get('attrs.col-sm')) {
      return 'col-sm-' + this.get('attrs.col-sm');
    }
    else{
      return "";
    }
  }),
  lg:Ember.computed('attrs.col-lg',function(){
    if(this.get('attrs.col-lg')) {
      return 'col-lg-' + this.get('attrs.col-lg');
    }
    else{
      return "";
    }
  }),
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