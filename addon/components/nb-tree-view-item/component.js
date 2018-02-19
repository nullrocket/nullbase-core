import Component from "@ember/component";

import ThemedComponent from 'nullbase-core/mixins/nb-themed-component';
import TreeViewItemMixin from 'nullbase-core/mixins/nb-tree-view-item';
import layout from './template';
import {on} from "@ember/object/evented";
import {once} from "@ember/runloop";
import {computed, observer} from "@ember/object";
import {inject} from "@ember/service";


export default Component.extend(ThemedComponent, TreeViewItemMixin, {

  layout,
  gestures: inject(),
  open: false,
  classNameBindings: [ 'open:open:closed' ,'selected','hover'],
  hover:false,
  expansionIndicatorIcon: computed('openIcon', 'closedIcon', 'open', 'treeViewItems', 'treeViewItems.[]', 'treeViewItems.length', function () {
    if ( this.get('treeViewItems.length') ) {
      if ( this.get('open') ) {
        return this.get('openIcon')
      }
      else {
        return this.get('closedIcon');
      }
    }
    else {
      return 'no-indicator';
    }
  }),
  openIcon: 'menu-right-grey',
  closedIcon: 'menu-right-grey',
  icon: 'checkbox-blank-grey',
  _tracking:false,
  actions: {
    tap(e) {
      this.sendAction('attrs.on-tap', ...arguments);
    },
    down() {
      this.sendAction('attrs.on-down', ...arguments);
    },
    up() {
      this.sendAction('attrs.on-up', ...arguments);
    }
  },
  adjustHeight( open, adjustAmount ) {
    let self = this;


    if ( self.get('open') ) {

      self.get('element').querySelectorAll('.sub-items.' + self.get('_uniqueClassName'))[ 0 ].style.height = (open ? adjustAmount : -adjustAmount) + self.get('element').querySelectorAll('.sub-items.' + self.get('_uniqueClassName'))[ 0 ].scrollHeight + 'px';
      self.get('parentView').adjustHeight(self.get('open'), (open ? adjustAmount : -adjustAmount));
    }
    else {
      self.get('element').querySelectorAll('.sub-items.' + self.get('_uniqueClassName'))[ 0 ].style.height = '0px';
      self.get('parentView').adjustHeight(self.get('open'), 0);
    }


  },
  treeViewItemsDidChange: observer('treeViewItems', 'treeViewItems.[]', 'treeViewItems.length', function () {
    once(this, this.processTreeViewItemsDidChange)
  }),
  processTreeViewItemsDidChange() {

    let gestures = this.get('gestures');
    let self = this;
    if ( (self.get('treeViewItems.length') && this.get('element').querySelectorAll('.indicator-icon.' + this.get('_uniqueClassName'))[ 0 ] ) || self.get('hasBlock') ) {


      gestures.addEventListener(this.get('element').querySelectorAll('.indicator-icon.' + this.get('_uniqueClassName'))[ 0 ], 'tap', function (e) {
        e.stopPropagation();

        self.set('open', !self.get('open'));


        if ( self.get('open') ) {
          self.get('element').querySelectorAll('.sub-items.' + self.get('_uniqueClassName'))[ 0 ].style.height = self.get('element').querySelectorAll('.sub-items.' + self.get('_uniqueClassName'))[ 0 ].scrollHeight + 'px';
          self.get('element').querySelectorAll('.sub-items.' + self.get('_uniqueClassName'))[ 0 ].style.transform = 'translate3d(0px,0px, 0px)';

        }
        else {
          self.get('element').querySelectorAll('.sub-items.' + self.get('_uniqueClassName'))[ 0 ].style.height = '0px';
          self.get('element').querySelectorAll('.sub-items.' + self.get('_uniqueClassName'))[ 0 ].style.transform = 'translate3d(0px,-'+self.get('element').querySelectorAll('.sub-items.' + self.get('_uniqueClassName'))[ 0 ].scrollHeight+'px, 0px)';


        }

        self.get('parentView').adjustHeight(self.get('open'), self.get('element').querySelectorAll('.sub-items.' + self.get('_uniqueClassName'))[ 0 ].scrollHeight);


      });

    }
  },
  willDestroyElement(){
    this._super(...arguments);

    this.get('gestures').removeEventListener(this.get('element').querySelectorAll('.item.' + this.get('_uniqueClassName'))[ 0 ],'tap',this._tap);
    this.get('gestures').removeEventListener(this.get('element').querySelectorAll('.item.' + this.get('_uniqueClassName'))[ 0 ],'trackend',this._trackend);
    this.get('gestures').removeEventListener(this.get('element').querySelectorAll('.item.' + this.get('_uniqueClassName'))[ 0 ],'trackstart',this._trackstart);
    this.get('element').removeEventListener('mouseenter',this._mouseenter);
    this.get('element').removeEventListener('mouseleave',this._mouseleave);
  },

  didInsertElement() {
    this._super(...arguments);
    let self = this;
    let gestures = this.get('gestures');
    this.get('element').querySelectorAll('.item.' + this.get('_uniqueClassName'))[ 0 ].dataset.wiggle = 200;
    this._tap = function (e) {
      if(!self.get('_tracking')) {

        self.send("tap", e);
      }

      self.set('_tracking',false);

    };
    gestures.addEventListener(this.get('element').querySelectorAll('.item.' + this.get('_uniqueClassName'))[ 0 ], 'tap', this._tap);

    this._trackend = function(e){

      self.set('_tracking',false);

    };

    gestures.addEventListener(this.get('element').querySelectorAll('.item.' + this.get('_uniqueClassName'))[ 0 ],'trackend',this._trackend);

    this._trackstart = function(e){

      self.set('_tracking',true);

    };
    gestures.addEventListener(this.get('element').querySelectorAll('.item.' + this.get('_uniqueClassName'))[ 0 ],'trackstart',this._trackstart);


    this._mouseenter =  function () {
      self.set('hover', true);
    };
    this.get('element').addEventListener('mouseenter',this._mouseenter);

    this._mouseleave =  function () {
      self.set('hover', false);
    };
    this.get('element').addEventListener('mouseleave',this._mouseleave);
  }
});