import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
  layout,
  classNames:['dialog-row'],
  attributeBindings:['tabindex'],
  tabindex:0
});
