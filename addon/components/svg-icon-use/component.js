import Component from '@ember/component';
import {computed, observer} from '@ember/object';
import {on} from "@ember/object/evented";
import layout from './template';

export default Component.extend({
  layout,
  tagName: 'use',
  icon: "",
  iconObserver: observer('icon', function () {
    if ( this.get('element') ) {
      this.get('element').setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', this.get("icon"))
    }
  }),
  didInsertElement() {
    this._super(...arguments);
    this.get('element').setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', this.get("icon"))
  }


});