import Ember from 'ember';
import SpreadMixin from 'ember-spread';
export default Ember.Mixin.create(SpreadMixin, {
  parentER: null,

  didInsertElement: function () {
  //  this.set('parentER', this.get('parentView.childComponentsX'));

    this.get('parentView.childComponentsX').pushObject(this);

    this._super(...arguments);
  },
  willDestroyElement: function () {
  //  if ( this.get('parentER') ) {

      this.get('parentView.childComponentsX').removeObject(this);
 //   }
    this._super(...arguments);
  }

});
