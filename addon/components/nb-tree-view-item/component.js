import Component from "@ember/component";

import ThemedComponent from 'nullbase-core/mixins/nb-themed-component';
import TreeViewItemMixin from 'nullbase-core/mixins/nb-tree-view-item';
import layout from './template';
import {on} from "@ember/object/evented";
import {once,run} from "@ember/runloop";
import {computed, observer,trySet} from "@ember/object";
import {inject} from "@ember/service";


export default Component.extend(ThemedComponent, TreeViewItemMixin, {

  layout,
  gestures: inject(),
  open: computed('_open',function(){
    return this.get('_open');
  }),
  _open:true,
  openStateId:"",
  classNameBindings: [ 'open:open:closed', 'selected', 'hover' ],
  hover: false,
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
  expandtOnTap:true,
  _tracking: false,
  init(){
    this._super(...arguments);
    if(this.get('openStateId')){
      let openState = storage.get(this.get('openStateId'),true);
      this.set('_open',openState);
    }
  },
  actions: {
    tap( e ) {
      this.sendAction('attrs.on-tap', ...arguments);
    },
    down() {
      this.sendAction('attrs.on-down', ...arguments);
    },
    up() {
      this.sendAction('attrs.on-up', ...arguments);
    }
  },
  adjustHeight( open, adjustAmount,from ) {
    let self = this;


    if ( self.get('open') ) {

      self.get('element').querySelectorAll('.sub-items.' + self.get('_uniqueClassName'))[ 0 ].style.height = (open ? adjustAmount : -adjustAmount) + self.get('element').querySelectorAll('.sub-items.' + self.get('_uniqueClassName'))[ 0 ].scrollHeight + 'px';
      self.get('parentView').adjustHeight(self.get('open'), (open ? adjustAmount : -adjustAmount),this.get('element'));
    }
    else {
      self.get('element').querySelectorAll('.sub-items.' + self.get('_uniqueClassName'))[ 0 ].style.height = '0px';
      self.get('parentView').adjustHeight(self.get('open'), 0,this.get('element'));
    }


  },
  treeViewItemsDidChange: observer('treeViewItems', 'treeViewItems.[]',  function () {
    once(this, this.processTreeViewItemsDidChange)
  }),

  treeViewOpenDidChange: on('init', observer('open',  function () {

    once(this, this.processTreeViewOpenDidChange);
  })),


  processTreeViewOpenDidChange() {
    let self = this;

    if ( self.get('open') ) {
      self.get('element').querySelectorAll('.sub-items.' + self.get('_uniqueClassName'))[ 0 ].style.height = self.get('element').querySelectorAll('.sub-items.' + self.get('_uniqueClassName'))[ 0 ].scrollHeight + 'px';
      self.get('element').querySelectorAll('.sub-items.' + self.get('_uniqueClassName'))[ 0 ].style.transform = 'translate3d(0px,0px, 0px)';

    }
    else {
      self.get('element').querySelectorAll('.sub-items.' + self.get('_uniqueClassName'))[ 0 ].style.height = '0px';
      self.get('element').querySelectorAll('.sub-items.' + self.get('_uniqueClassName'))[ 0 ].style.transform = 'translate3d(0px,-' + self.get('element').querySelectorAll('.sub-items.' + self.get('_uniqueClassName'))[ 0 ].scrollHeight + 'px, 0px)';


    }

    self.get('parentView').adjustHeight(self.get('open'), self.get('element').querySelectorAll('.sub-items.' + self.get('_uniqueClassName'))[ 0 ].scrollHeight,this.get('element'));


  },
  _onClickExpand:null,
  processTreeViewItemsDidChange() {

    let gestures = this.get('gestures');
    let self = this;
    if ( (self.get('treeViewItems.length') && this.get('element').querySelectorAll('.indicator-icon.' + this.get('_uniqueClassName'))[ 0 ] ) || self.get('hasBlock') ) {
      if(this._onClickExpand === null){
        this._onClickExpand = function ( e ) {

          e.stopPropagation();

          self.set('_open', !self.get('_open'));
          if(self.get('openStateId')){
            storage.set(self.get('openStateId'),self.get('_open'));
          }


        };
      }
      else {
        gestures.removeEventListener(this.get('element').querySelectorAll('.indicator-icon.' + this.get('_uniqueClassName'))[ 0 ], 'tap', this._onClickExpand);
      }


      gestures.addEventListener(this.get('element').querySelectorAll('.indicator-icon.' + this.get('_uniqueClassName'))[ 0 ], 'tap', this._onClickExpand);

    }

  },
  willDestroyElement() {
    this._super(...arguments);

    let itemElement = this.get('element').querySelectorAll('.item.' + this.get('_uniqueClassName'))[ 0 ];
    let self = this;
    if ( itemElement ) {
      this.get('gestures').removeEventListener(itemElement, 'tap', this._tap);
      this.get('gestures').removeEventListener(itemElement, 'trackend', this._trackend);
      this.get('gestures').removeEventListener(itemElement, 'trackstart', this._trackstart);
      itemElement.removeEventListener('mouseenter', this._mouseenter);
      itemElement.removeEventListener('mouseleave', this._mouseleave);
      if ( (self.get('treeViewItems.length') && this.get('element').querySelectorAll('.indicator-icon.' + this.get('_uniqueClassName'))[ 0 ] ) || self.get('hasBlock') ) {
        if ( this._onClickExpand !== null ) {
          this.get('gestures').removeEventListener(this.get('element').querySelectorAll('.indicator-icon.' + this.get('_uniqueClassName'))[ 0 ], 'tap', this._onClickExpand);
        }

      }
    }

  },

  didInsertElement() {
    this._super(...arguments);
    let self = this;
    let gestures = this.get('gestures');
    let itemElement = this.get('element').querySelectorAll('.item.' + this.get('_uniqueClassName'))[ 0 ];
    if ( itemElement ) {
      itemElement.dataset.wiggle = 200;

      this._tap = function ( e ) {
        if ( !self.get('_tracking') ) {
          run(()=>{
            if(self.get('expandOnTap')) {
              self.set('_open', !self.get('_open'));
              if(self.get('openStateId')){
                storage.set(self.get('openStateId'),self.get('_open'));
              }

            }
            else {
              self.send("tap", e)

            }
          })

       /*   ;*/
        }

        if(!self.get('isDestroyed')) {
          trySet(self, '_tracking', false);
        }

      };
      gestures.addEventListener(itemElement, 'tap', this._tap);

      this._trackend = function ( e ) {

        if(!self.get('isDestroyed')) {
          trySet(self, '_tracking', false);
        }

      };

      gestures.addEventListener(itemElement, 'trackend', this._trackend);

      this._trackstart = function ( e ) {
        if(!self.get('isDestroyed')) {
          trySet(self, '_tracking', true);
        }

      };
      gestures.addEventListener(itemElement, 'trackstart', this._trackstart);

      this._mouseenter = function (e) {
        if(!self.get('isDestroyed')) {
          trySet(self, 'hover', true);
        }

      };
      itemElement.addEventListener('mouseenter', this._mouseenter);

      this._mouseleave = function () {
        if(!self.get('isDestroyed')) {
          trySet(self, 'hover', false);
        }

      };
      itemElement.addEventListener('mouseleave', this._mouseleave);
    }

  }
});