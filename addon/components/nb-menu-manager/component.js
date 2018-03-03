import { scheduleOnce } from '@ember/runloop';
import { A } from '@ember/array';
import Component from '@ember/component';
import Mixin from '@ember/object/mixin';
import EmberObject from '@ember/object';
import Ember from 'ember';
import layout from './template';
import find from "lodash/find";
import isUndefined from "lodash/isUndefined";
import has from 'lodash/has';

let ActionProxy = EmberObject.extend(Ember.ActionHandler);


import uniqueClass from 'nullbase-core/utils/uniq-class';


let InboundAction = Mixin.create({
  init: function () {
    this._super(...arguments);
    var proxy = ActionProxy.create({
      target: this
    });
    this.set('actionReceiver.actionHandler', proxy);

  }

});


export default Component.extend(InboundAction, {
  layout,

  init: function () {
    this.set('actionReceiver', this.get('menuManager'));
    this._super(...arguments);
    this.set('_uniqueClassName', uniqueClass());
    this.set('menus',A([]));
    this.set('menuInstances',A([]));
  },
  menus:'',
  menuInstances: '',
  classNames: [ 'menu-manager' ],

  actions: {
    remove( aMenu ) {
      try {

        if ( aMenu ) {
          var menuToRemove = find(this.get('menus'), function ( menu ) {
            return menu.menuID === aMenu.get('menuID');
          });
          if ( aMenu.get('options.owner') ) {
            aMenu.get('options.owner').set('open', false);
          }

          let element = aMenu.get('tetherObject').element;
          let menuManager = document.querySelectorAll('.nb-menu-backdrop')[ 0 ];
          menuManager.appendChild(element);
          aMenu.get('tetherObject').destroy();

          this.get('menus').removeObject(menuToRemove);


        }
      }
      catch ( e ) {
        console.log(e);
      }
      //   element.remove();
    },




    show ( menuComponent, args ) {

      // this.get('reduxStore').dispatch({type:'BLOCK_TRANSITIONS'});
      let self = this;
      let uniqId = this.get('_uniqueClassName');
      let type = isUndefined(args) ? "not-set" : has(args, "type") ? args.type : 'not-set';
      let owner = isUndefined(args) ? null : has(args, "owner") ? args.owner : null;

      this.get('menus').pushObject({ name: menuComponent, menuID: uniqId, tether: args.tether, type: type, args: args });
      let menu = null;

      scheduleOnce('afterRender', function () {
        menu = find(self.get('menuInstances'), function ( menu ) {

          return menu.get('menuID') === uniqId;
        });

        if ( menu ) {
          if ( owner ) {

            owner.set('childMenu', menu);
          }

            menu.send('show', args);


        }
      });

    }
  }

});