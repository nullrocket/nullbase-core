import Ember from 'ember';
import layout from './template';
import find from "lodash/find";
import isUndefined from "lodash/isUndefined";
import has from 'lodash/has';

var ActionProxy = Ember.Object.extend(Ember.ActionHandler);
var uniqID = {
  counter: 0,
  get: function ( prefix ) {
    if ( !prefix ) {
      prefix = "uniqid";
    }
    var id = prefix + "" + uniqID.counter++;
    if ( jQuery("#" + id).length === 0 ) {
      return id;
    }
    else {
      return uniqID.get();
    }

  }
};
var InboundAction = Ember.Mixin.create({
  init: function () {
    this._super(...arguments);
    var proxy = ActionProxy.create({
      target: this
    });
    this.set('actionReceiver.actionHandler', proxy);
  }

});


export default Ember.Component.extend(InboundAction, {
  layout,

  init: function () {

    this.set('actionReceiver', this.get('menuManager'));

    this._super(...arguments);


  },

  menus: Ember.A([]),
  menuInstances: Ember.A([]),
  classNames: [ 'menu-manager' ],

  /* reduxStore:Ember.inject.service(),*/
  actions: {
    remove: function ( aMenu ) {

      if(aMenu) {
        //     this.get('reduxStore').dispatch({type:'ALLOW_TRANSITIONS'});
        var menuToRemove = find(this.get('menus'), function ( menu ) {

          return menu.menuID === aMenu.get('menuID');
        });

        let element = aMenu.get('tetherObject').element;
        $(aMenu.get('tetherObject').element).appendTo('.menu-manager .nb-menu-backdrop');

        aMenu.get('tetherObject').destroy();
        //  aMenu.get('tether').focus();
        this.get('menus').removeObject(menuToRemove);
        $(element).remove();
      }
    },


    show: function ( menuComponent, args ) {

      // this.get('reduxStore').dispatch({type:'BLOCK_TRANSITIONS'});
      var self = this;
      var uniqId = uniqID.get("menu");
      var type = isUndefined(args) ? "not-set" : has(args, "type") ? args.type : 'not-set';
      var owner = isUndefined(args) ? null : has(args, "owner") ? args.owner : null;

      this.get('menus').pushObject({ name: menuComponent, menuID: uniqId, tether: args.tether, type: type, args: args });
      let menu = null;

      Ember.run.scheduleOnce('afterRender', function () {
        menu = find(self.get('menuInstances'), function ( menu ) {

          return menu.get('menuID') === uniqId;
        });

        if ( menu ) {
          if ( owner ) {

            owner.set('childMenu', menu);
          }
          setTimeout(function () {
            menu.send('show', args);
          }, 0)

        }
      });

    }
  }

});