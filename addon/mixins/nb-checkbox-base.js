/*globals $:false */
import Ember from 'ember';
import ThemedComponent from 'nullbase-core/mixins/nb-themed-component';
import ButtonLike from 'nullbase-core/mixins/nb-button-like';
export default Ember.Mixin.create(ThemedComponent,ButtonLike, {
  tagName: "div",
  label: "",
  classNameBindings: [ 'disabled:disabled', 'type', 'labelPosition', 'label::no-label', 'pressed:pressed', 'hover:hover' ],
  disabled: false,
  icon: Ember.computed('checked', function () {
    var self = this;
    if ( this.get('checked') ) {

      if ( self && !self.get('isDestroying') && !self.get('isDestroyed') && self.get('element').getElementsByClassName('button-icon')[ 0 ] ) {
        self.get('element').getElementsByClassName('button-icon')[ 0 ].classList.add('animate');
      }

    }
    else {

      if ( self && !self.get('isDestroying') && !self.get('isDestroyed') && self.get('element').getElementsByClassName('button-icon')[ 0 ] ) {
        self.get('element').getElementsByClassName('button-icon')[ 0 ].classList.remove('animate');
      }

    }

  }),
  checkedIcon: "checkbox-marked-grey",
  uncheckedIcon: "checkbox-blank-outline-grey",
  maybeCheckedIcon: "minus-box-grey",
  _currentIcon: Ember.computed('uncheckedIcon', 'checkedIcon', 'maybeCheckedIcon', 'checked', function () {
    return this.get('checked') ? this.get('checkedIcon') : this.get('checked') != null ? this.get('uncheckedIcon') : this.get('maybeCheckedIcon');
  }),



});
