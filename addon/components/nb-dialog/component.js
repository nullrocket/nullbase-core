import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  classNames:['dialog-row'],
  attributeBindings:['tabindex'],
  tabindex:0
});
