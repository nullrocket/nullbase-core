import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  classNames: ['nb-dialog-body'],
  attributeBindings:['tabindex'],
  tabindex:0
});
