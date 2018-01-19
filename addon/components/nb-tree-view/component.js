import Component from "@ember/component";
import Ember from 'ember';
import layout from './template';
import ThemedComponent from 'nullbase-core/mixins/nb-themed-component';

export default Component.extend(ThemedComponent, {
  layout,
  classNames: [ 'nb-tree-view' ],
  treeViewItems: null,
  init(){
    this._super(...arguments);
    this.set('treeViewItems',Ember.A([]))
  },
  adjustHeight() {

  },
});