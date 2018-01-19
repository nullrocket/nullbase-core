

import Component from "@ember/component";
import { computed,observer } from "@ember/object"
import layout from './template';
import ThemedComponent from 'nullbase-core/mixins/nb-themed-component';
import createFocusTrap from "nullbase-core/utils/focus-trap";
import { inject } from "@ember/service";
import max from "lodash/max";
import map from 'lodash/map';
import merge from 'lodash/merge';
import find from 'lodash/find';


function topZIndex() {

  return max(map(document.querySelectorAll('*'), function ( el ) {
    return parseInt(
      getComputedStyle(el, null).getPropertyValue('z-index')
    );

  }));
}
export default Component.extend(ThemedComponent, {
  layout,
  menuIcon: "menu-down-grey",
  gestures: inject(),
  classNames: [ 'nb-select' ],
  parentFocusTrap: null,
  icon: "",
  optionComponent:'nb-select-option',
  init(){
    this._super(...arguments);

  },
  error: false,
  options: [ { value: 2, display: 'sdf' }, { value: 3, display: "sdflkasjdf" }, { value: 1, display: "s2134lk" } ],
  displayOptions: computed('options', 'value', function () {
    var self = this;
    return map(this.get('options'), function ( option ) {
      return merge({}, option, { selected: option.value === self.get('value') })
    })
  }),
  actions: {
    onSelectOption( value ){
      this.sendAction('onSelectOption', value);
      this.send('closeDropDown');

    },
    closeDropDown(){
      this.get('gestures').removeEventListener(document, 'down', this._bodyDown);
      this.get('focusTrap').deactivate();
      this.get('dropDown').style.display = 'none';
      this.get('element').getElementsByClassName('select-display')[0].focus();

    },
    showDropDown(){

      this.get('gestures').addEventListener(document, 'down', this._bodyDown);

      this.get('dropDown').style.display = 'block';

      this.get('tetherObject').element.style.width = this.get('element').getElementsByClassName('input-wrapper')[0].offsetWidth +'px';

      Tether.position();
      this.get('dropDown').focus();
      this.get('focusTrap').activate()


    }
  },
  display: computed('value', function () {
    let selectedOption = find(this.get('options'), { value: this.get('value') });

    if ( selectedOption ) {
      return selectedOption.display;
    }
    else {
      return "";
    }
  }),
  willDestroyElement(){
   
   this.get('tetherObject').element.appendChild(this.get('element'));


    this.get('tetherObject').destroy();
  },
  didInsertElement(){
    this._super(...arguments);

    let self = this;
    let gestures = this.get('gestures');

    this.get('element').getElementsByClassName('nb-select-drop-down')[0].style.width =this.get('element').getElementsByClassName('input-wrapper')[0].offsetWidth +'px';


    var $dropDown = this.get('element').getElementsByClassName('nb-select-drop-down')[0];
    this.set('dropDown', $dropDown);
    var tetherObject = new Tether({
      element: this.get('element').getElementsByClassName('nb-select-drop-down')[0],
      target: this.get('element').getElementsByClassName('input-wrapper')[0],
      attachment: 'top left',
      targetAttachment: 'top left',
      //    offset: side ==="right" ? "0 "+width+"px" :"0 0",
      optimizations: {

        gpu: false
      },

    });

    this.set('tetherObject', tetherObject);

    var focusTrap = createFocusTrap(this.get('tetherObject').element, {
      initialFocus: this.get('tetherObject').element,
      onActivate: function () {
        if ( self.get('parentFocusTrap') ) {
          self.get('parentFocusTrap').pause();
        }
      },
      onDeactivate: function () {
        if ( self.get('parentFocusTrap') ) {
          self.get('parentFocusTrap').unpause();
        }
      }
    });

    this.set('focusTrap', focusTrap);

    $dropDown.style.zIndex =  topZIndex();
    this._tap = function ( event ) {
      event.preventDefault();
      event.stopPropagation();
      self.send('showDropDown');
    };

    this._bodyDown = function ( event ) {
      self.send('closeDropDown');

    };

    this.get('element').addEventListener('keydown', function ( evt ) {
      var key = evt.which || evt.keyCode;


      if ( key === 32 ) {
        event.preventDefault();
        event.stopPropagation();

        self.send('showDropDown');
      }


      // down arrow
      if ( key === 40 ) {
        event.preventDefault();
        event.stopPropagation();
        self.send('showDropDown');
      }

    });


    gestures.addEventListener(this.get('element'), 'tap', this._tap);

  }
});
