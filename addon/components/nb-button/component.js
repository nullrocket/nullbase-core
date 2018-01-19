
import Component from "@ember/component";
import { computed } from "@ember/object"
import layout from './template';
import ButtonLike from 'nullbase-core/mixins/nb-button-like';
import offset from 'nullbase-core/util/offset';


export default Component.extend(ButtonLike, {
  layout,
  classNames:['nb-button'],
  elevation: computed('pressed',
    function () {
      if ( (this.get('attrs.type') === 'raised-text' || this.get('attrs.type') === 'raised-icon') ) {
        if ( this.get('pressed') ) {
          return 'elevation-8dp';
        }
        else {
          return 'elevation-2dp'
        }

      }
      else {
        return '';
      }
    }),

  size: '',
  attributeBindings: [ 'touchAction:touch-action', 'disabled:disabled', "title:title" ],
  touchAction: 'none',
  disabled: false,
  useNativeClick: false,
  ink: true,
  type: "flat-text",//"flat-text" , "raised-text", "flat-icon", "raised-icon"
  icon: "",

  _insertedStyles: [],
  _themeProperties: [
    'attrs.pressed-background-color',
    'attrs.focused-background-color',
    'attrs.pressed-background-color',
    'attrs.focused-background-color',
    'attrs.focused-text-color',
    'attrs.pressed-text-color',
    'attrs.background-color',
    'attrs.ink-color',
    'attrs.text-color'
  ],



  beforeKeyDown() {
    let element = this.get('element');
    let ink = element.getElementsByClassName('ink')[ 0 ];
    let inner = element.getElementsByClassName('inner')[ 0 ];
    let self = this;


    if ( !self.get('disabled') && self.get('ink') ) {
      ink.classList.add('inkColor');
    }

    if ( self.get('ink') ) {
      if ( !ink.offsetWidth && !ink.offsetHeight ) {
        let max = Math.max(inner.offsetWidth, inner.offsetHeight);
        ink.style.width = max + 'px';
        ink.style.height = max + 'px';
      }

      let x = 0;
      let y = 0;
      ink.style.top = y + 'px';
      ink.style.left = x + 'px';

      ink.classList.add('animate');

    }
  },
  beforeKeyUp(){
    let self = this;
    if ( self.get('ink') ) {
      let element = this.get('element');
      let ink = element.getElementsByClassName('ink')[ 0 ];

      ink.classList.remove('animate');
    }
  },




  beforeDown(event) {
    let element = this.get('element');
    let inner = element.getElementsByClassName('inner')[ 0 ];
    let ink = element.getElementsByClassName('ink')[ 0 ];
    let self = this;

    if ( !self.get('disabled') && self.get('ink') ) {
      ink.classList.add('inkColor');
    }

    if ( self.get('ink') ) {
      if ( !ink.offsetWidth && !ink.offsetHeight ) {
        let max = Math.max(inner.offsetWidth, inner.offsetHeight);
        ink.style.width = max + 'px';
        ink.style.height = max + 'px';
      }

      let x = event.pageX - offset(inner).left - ink.offsetWidth / 2;
      let y = event.pageY - offset(inner).top - ink.offsetHeight / 2;
      ink.style.top = y + 'px';
      ink.style.left = x + 'px';

      ink.classList.add('animate');

    }
  },

  beforeTap() {
    let element = this.get('element');
    let ink = element.getElementsByClassName('ink')[ 0 ];
    ink.classList.remove('animate');
  },
  _onBodyKeyUp(){
    if ( this.get('ink') ) {
      let element = this.get('element');
      let ink = element.getElementsByClassName('ink')[ 0 ];
      ink.classList.remove('animate');
    }
  },
  _onBodyUp(){
    if ( this.get('ink') ) {
      let element = this.get('element');
      let ink = element.getElementsByClassName('ink')[ 0 ];
      ink.classList.remove('animate');
    }
  },
  _onKeyUp(){
    if ( this.get('ink') ) {
      let element = this.get('element');
      let ink = element.getElementsByClassName('ink')[ 0 ];
      ink.classList.remove('animate');
    }
  }

});
