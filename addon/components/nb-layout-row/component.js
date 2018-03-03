import Component from '@ember/component';
import layout from './template';
import ThemedComponent from 'nullbase-core/mixins/nb-themed-component';


export default Component.extend(ThemedComponent, {
  tagName:'div',
  classNames: ["row"],
  xsAlign:"",
  smAlign:"",
  lgAlign:"",
  mdAlign:"",
  layout
});