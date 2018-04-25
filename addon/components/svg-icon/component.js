
import Component from '@ember/component';
import {computed} from '@ember/object';
import layout from './template';
export default Component.extend( {
  layout,
  tagName: 'svg',

  classNames: ['icon','svg-icon'],
  classNameBindings:['_color','size'],
  _icon:computed('icon.[]','icon',function(){
    return '../nullbase-icons/svg-map.svg#'+this.get('icon')[0];
  }),
  _color:computed('icon.[]','icon',function(){
      return this.get('icon')[1];
  }),
  icon:null,
  init(){
    this._super(...arguments);
  //  this.set('icon',A(["",""]));
  }

});