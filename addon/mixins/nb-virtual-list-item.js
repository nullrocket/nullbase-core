import Mixin from '@ember/object/mixin';
import SpreadMixin from 'ember-spread';
import { inject } from "@ember/service";
export default Mixin.create(SpreadMixin, {
  parentER: null,
  intersection: inject(),
  propName:'item',
  delayedProp:null,
  didInsertElement: function () {
  //  this.set('parentER', this.get('parentView.childComponentsX'));
try {
  this._super(...arguments);
  this.get('parentView.childComponentsX').pushObject(this);
}
catch(e){
  console.log(e)
}
/*
    this.get('intersection').observe(this.get('element'));
    let self = this;
    this._inView = function (  ) {

      self.set(self.get('propName'),self.get('delayedProp'));

    };
    this.get('element').addEventListener('inview', this._inView);
*/

  },
  willDestroyElement: function () {
  //  if ( this.get('parentER') ) {
try {
  this.get('parentView.childComponentsX').removeObject(this);
  //   }
  this._super(...arguments);
}
catch(e){
  console.log(e);
}
  }

});
