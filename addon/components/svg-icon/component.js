
import Component from '@ember/component';
import {computed,observer} from '@ember/object';
import layout from './template';
import {on} from "@ember/object/evented";
function isSafari (){
  return (navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1) ;
}

export default Component.extend( {
  layout,
  tagName: 'svg',

  classNames: ['icon','svg-icon'],
  classNameBindings:['_color','size'],
  _icon:computed('icon.[]','icon',function(){

    return '#'+this.get('icon')[0];
  }),
  setIcon:on('init',observer('icon.[]','icon',function(){
    if(this.get('element') && this.get('icon')[0]) {
      if(isSafari())
      {
        console.log('is Safari?')
        $('use',this.get('element')).attr('xlink:href', '#' + this.get('icon')[ 0 ])
      }
      else
        {
        $('use',this.get('element')).attr('href', '#' + this.get('icon')[ 0 ])
      }

    }
  })),
  _color:computed('icon.[]','icon',function(){
      return this.get('icon')[1];
  }),
  icon:null,
  init(){
    this._super(...arguments);
  //  this.set('icon',A(["",""]));

  },
  didInsertElement(){
    this._super(...arguments);
    if(this.get('element') && this.get('icon')[0]) {
      if(isSafari())
      {
        console.log('is Safari?')
        $('use',this.get('element')).attr('xlink:href', '#' + this.get('icon')[ 0 ])
      }
      else{
        $('use',this.get('element')).attr('href', '#' + this.get('icon')[ 0 ])
      }
    }
  }

});