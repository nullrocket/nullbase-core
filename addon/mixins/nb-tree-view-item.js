import Ember from 'ember';
import Mixin from '@ember/object/mixin';
import { computed } from "@ember/object"
import { inject as service } from '@ember/service';
import uniqueClass from 'nullbase-core/utils/uniq-class';
export default Mixin.create( {
  classNames: [ 'nb-tree-view-item' ],
  parentER: null,
  gestures: service(),
  treeViewItems:null,
  init() {
    this._super(...arguments);
    this.set('treeViewItems',Ember.A([]));
    this.set('_uniqueClassName', uniqueClass());
  },
  adjustHeight(){

  },
  didInsertElement: function () {
    this.set('parentER', this.get('parentView.treeViewItems'));
    this.get('parentView.treeViewItems').pushObject(this);
    this._super(...arguments);
  },
  willDestroyElement: function () {
    if ( this.get('parentER') ) {

      this.get('parentER').removeObject(this);
    }
    this._super(...arguments);
  }

});
