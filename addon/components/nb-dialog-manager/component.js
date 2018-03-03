import { scheduleOnce } from '@ember/runloop';
import { A } from '@ember/array';
import Component from '@ember/component';
import Mixin from '@ember/object/mixin';
import EmberObject from '@ember/object';
import Ember from 'ember';
import layout from './template';
import find from "lodash/find";
import isUndefined from 'lodash/isUndefined';
import has from 'lodash/has';
var ActionProxy = EmberObject.extend(Ember.ActionHandler);
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
}
var InboundAction = Mixin.create({
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

    this.set('actionReceiver', this.get('dialogManager'));

    this._super(...arguments);


  },

  dialogs: A([]),
  dialogInstances: A([]),
  classNames: [ 'modal-dialog-manager' ],

  /* reduxStore:Ember.inject.service(),*/
  actions: {
    remove: function ( aDialog ) {
      //     this.get('reduxStore').dispatch({type:'ALLOW_TRANSITIONS'});
      var dialogToRemove = find(this.get('dialogs'), function ( dialog ) {

        return dialog.dialogID === aDialog.get('dialogID');
      });

      this.get('dialogs').removeObject(dialogToRemove);

    },
    removeByType: function ( type ) {

     //this.get('reduxStore').dispatch({ type: 'ALLOW_TRANSITIONS' });
      var dialogToRemove = find(this.get('dialogs'), function ( dialog ) {

        return dialog.type === type;
      });

      this.get('dialogs').removeObject(dialogToRemove);

    },

    show: function ( dialogComponent, args ) {

     // this.get('reduxStore').dispatch({type:'BLOCK_TRANSITIONS'});
      var self = this;
      var uniqId = uniqID.get("dialog");
      var type = isUndefined(args) ? "not-set" : has(args, "type") ? args.type : 'not-set';

      this.get('dialogs').pushObject({ name: dialogComponent, dialogID: uniqId, type: type, args: args });


      scheduleOnce('afterRender', function () {
        var dialog = find(self.get('dialogInstances'), function ( dialog ) {

          return dialog.get('dialogID') === uniqId;
        });

        if ( dialog ) {
          setTimeout(function () {
            dialog.send('show', args);
          }, 0)

        }
      });

    }
  }

});
