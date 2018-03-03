import Component from "@ember/component";
import { computed } from "@ember/object"
import layout from './template';
import { next } from "@ember/runloop"


import CheckBoxBase from 'nullbase-core/mixins/nb-checkbox-base';
import offset from 'nullbase-core/util/offset';

export default Component.extend(CheckBoxBase, {
  layout,
  tagName: "div",
  classNames: [ 'nb-checkbox' ],
  label: "",
  classNameBindings: [ 'disabled:disabled', 'type', 'labelPosition', 'label::no-label', 'pressed:pressed', 'hover:hover' ],

  labelPosition: 'right',

  useNativeClick: false,
  ink: true,
  icon: computed('checked', function () {
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
  _currentIcon: computed('uncheckedIcon', 'checkedIcon', 'maybeCheckedIcon', 'checked', function () {
    return this.get('checked') ? this.get('checkedIcon') : this.get('checked') != null ? this.get('uncheckedIcon') : this.get('maybeCheckedIcon');
  }),

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
  beforeKeyUp() {
    let self = this;
    if ( self.get('ink') ) {
      let element = this.get('element');
      let ink = element.getElementsByClassName('ink')[ 0 ];

      ink.classList.remove('animate');
    }
  },

  bleg() {

    let element = this.get('element');
    let buttonIcon = element.getElementsByClassName('button-icon')[ 0 ];
    next(() => {
      buttonIcon.classList.add('animate');
    })

  },


  beforeDown( event ) {
if(this.get('pressed')) {
  let element = this.get('element');
  let inner = element.getElementsByClassName('inner')[ 0 ];
  let ink = element.getElementsByClassName('ink')[ 0 ];

  let self = this;
  let display = inner.style.display;

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
    if ( y > (ink.offsetHeight) / 2 || x > (ink.offsetWidth) / 2 ) {
      ink.style.top = 0 + 'px';
      ink.style.left = 0 + 'px';
    }


    ink.classList.add('animate');

  }
}
  },

  beforeTap() {
    let element = this.get('element');
    let ink = element.getElementsByClassName('ink')[ 0 ];
    ink.classList.remove('animate');

  },
  _onBodyKeyUp() {
    if ( this.get('ink') ) {
      let element = this.get('element');
      let ink = element.getElementsByClassName('ink')[ 0 ];
      ink.classList.remove('animate');
    }
  },
  _onBodyUp() {
    if ( this.get('ink') ) {
      let element = this.get('element');
      let ink = element.getElementsByClassName('ink')[ 0 ];
      ink.classList.remove('animate');
      let buttonIcon = element.getElementsByClassName('button-icon')[ 0 ];
      buttonIcon.classList.remove('animate');
    }
  },
  _onKeyUp() {
    if ( this.get('ink') ) {
      let element = this.get('element');
      let ink = element.getElementsByClassName('ink')[ 0 ];
      ink.classList.remove('animate');
      let buttonIcon = element.getElementsByClassName('button-icon')[ 0 ];
      buttonIcon.classList.remove('animate');
    }
  },

  _themeProperties: [
    'attrs.pressed-background-color',
    'attrs.focused-background-color',
    'attrs.pressed-background-color',
    'attrs.focused-background-color',
    'attrs.focused-text-color',
    'attrs.pressed-text-color',
    'attrs.background-color',
    'attrs.text-color'
  ],

});
