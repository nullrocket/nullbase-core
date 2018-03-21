import Component from "@ember/component";

import ThemedComponent from 'nullbase-core/mixins/nb-themed-component';
import TreeViewItemMixin from 'nullbase-core/mixins/nb-tree-view-item';
import layout from './template';
import { on } from "@ember/object/evented";
import { scheduleOnce,once,next } from "@ember/runloop";
import { computed, observer } from "@ember/object";
import { inject } from "@ember/service";


export default Component.extend(ThemedComponent, TreeViewItemMixin, {

  layout,
  gestures: inject(),
  open: false,
  classNameBindings: [ 'open:open:closed' ,'selected','hover'],
  hover:false,

  _tracking:false,

  adjustHeight( open, adjustAmount ) {
    let self = this;
   //  self.get('element').style.height = (open ? adjustAmount : -adjustAmount) + self.get('element').scrollHeight + 'px';
      self.get('parentView').adjustHeight(false, self.get('element').scrollHeight ,this.get('element'));

  },

  treeViewOpenDidChange:on('init',observer('open','treeViewItems', 'treeViewItems.[]', 'treeViewItems.length',function(){

    once(this,this.processTreeViewOpenDidChange);
  })),

  treeViewItemsDidChange: observer('treeViewItems', 'treeViewItems.[]', 'treeViewItems.length', function () {
    //once(this, this.processTreeViewItemsDidChange)
  }),


  processTreeViewOpenDidChange(){
    let self=this;
  next(this,function(){
    self.get('parentView').adjustHeight(this.get('open'),  self.get('element').scrollHeight,this.get('element'));
  });

  },

  willDestroyElement(){
    this._super(...arguments);


    this.get('element').removeEventListener('mouseenter',this._mouseenter);
    this.get('element').removeEventListener('mouseleave',this._mouseleave);
  },

  didInsertElement() {
    this._super(...arguments);
    let self = this;



    this._mouseenter =  function () {
      if(!self.get("isDestroyed")) {
        self.set('hover', true);
      }
    };
    this.get('element').addEventListener('mouseenter',this._mouseenter);

    this._mouseleave =  function () {
      if(!self.get('isDestroyed')) {
        self.set('hover', false);
      }
    };
    this.get('element').addEventListener('mouseleave',this._mouseleave);

    self.get('parentView').adjustHeight(this.get('open'),  self.get('element').scrollHeight);
  }
});