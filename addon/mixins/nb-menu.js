import { later } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';
import SpreadMixin from 'ember-spread';
import createFocusTrap from "nullbase-core/utils/focus-trap";

export default Mixin.create(SpreadMixin, {
  gestures: service(),
  classNames: [ 'nb-menu-backdrop' ],
  classNameBindings: [ 'size' ],
  size: 'size-1',

  focusTrap: null,
  init: function () {
    this._super(...arguments);
    this.get('parentView.menus').pushObject(this);
    this.set('parentComponent', this.get('parentView'));
  },

  willDestroyElement: function () {

    let gestures = this.get('gestures');
    gestures.removeEventListener($('body').get(0), 'down', this._bodyDown);
//    console.log('before', this.get('parentComponent.menus'));
//    this.get('parentComponent.menuInstances').removeObject(this);
    this.get('parentComponent').send('remove',this);
  //  console.log('after', this.get('parentComponent.menus'));
    this._super(...arguments);
  },
  parentComponent: null,

  defaultAction: '',
  keyPress: function ( e ) {
    if ( this.get('defaultAction') ) {
      var key = e.which || e.keyCode;
      if ( key === 13 && e.target.nodeName !== 'TEXTAREA' ) {
        e.stopPropagation();
        e.preventDefault();

        this.send(this.get('defaultAction'));
      }
    }
  },
  actions: {
    remove: function () {
      this.$().removeClass('show');
      this.$('.nb-menu').removeClass('show');

      if(this.get('focusTrap')) {
        this.get('focusTrap').deactivate();
      }
      //  setTimeout(function () {
      this.get('menuManager.actionHandler').send('remove', this)
      //   }, 175);

    },
    show: function () {

      later(this, function () {
        //      this.$().addClass('show');
        var focusTrap = createFocusTrap(this.get('tetherObject').element,{
          initialFocus:this.get('tetherObject').element
        });
        if(!this.get("isDestroyed")) {
          this.set('focusTrap', focusTrap);
          focusTrap.activate();
        }
      }, 1);


    }
  },

  _bodyDown: null,

  didInsertElement(){
    this._super(...arguments);
    let gestures = this.get('gestures');
    let self = this;
    this._bodyDown = function () {

      gestures.removeEventListener($('body').get(0), 'down', self._bodyDown, true);
      self.send('remove', self);
    };
    gestures.addEventListener($('body').get(0), 'down', this._bodyDown);

  }

});
