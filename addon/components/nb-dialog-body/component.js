import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
  layout,
  classNames: ['nb-dialog-body'],
  attributeBindings:['tabindex'],
  tabindex:0
});
