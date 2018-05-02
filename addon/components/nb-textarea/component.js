
import { equal, bool } from '@ember/object/computed';
import Component from "@ember/component";
import { computed, observer } from "@ember/object";
import layout from './template';
import ThemedComponent from 'nullbase-core/mixins/nb-themed-component';
import autosize from '../../util/autosize';
import isString from "lodash/isString";
import isArray from 'lodash/isArray';
import join from 'lodash/join';
import { next, scheduleOnce } from "@ember/runloop";
import { inject } from "@ember/service";
function __slice( item, start ) {
  start = ~~start;
  let len = item.length;
  let i
  let newArray = new Array(len - start);

  for ( i = start; i < len; i++ ) {
    newArray[ i - start ] = item[ i ];
  }

  return newArray;
}

export default Component.extend(ThemedComponent, {
  gestures: inject(),
  intersection: inject(),
  layout: layout,
  autocomplete: "off",
  _themeProperties: [
    'attrs.focused-border-color',
    'attrs.border-color',
    'attrs.border-error-color',
    'attrs.focused-border-error-color',
    'attrs.focused-label-color',
    'attrs.label-color',
    'attrs.error-label-color',
    'attrs.focused-error-label-color',
    'attrs.text-color',
    'attrs.error-text-color',
    'attrs.hint-text-color'
  ],
  tagName: 'nb-textarea',
  isMasked: false,
  type: "text",

  error: false,
  errorString: computed('error', 'showErrors', function () {
    if ( this.get("showErrors") ) {
      if ( isString(this.get('error')) ) {
        return this.get('error');
      }
      if ( isArray(this.get('error')) ) {
        return join(this.get('error'), ', ');
      }
    }
    return "";
  }),
  value: '',
  showErrors: false,
  monospace: false,
  classNames: [ 'selectable','nb-textarea' ],
  classNameBindings: [ 'hasIcon:icon', 'monospace:monospace', 'hasText:has-text:no-text', 'focused:focused:not-focused', 'hasLabel:has-label:no-label', 'hasError:has-error:no-error', 'type' ],
  hasText: bool('value'),
  hasLabel: bool('label'),
  description: "",
  focusedDescriptionProperty: "",
  rows: 1,
  passwordToggleTitle: "Show Masked",
  copyFieldTitle: "Copy to clipboard",
  hasError: computed('error', 'showErrors', function () {
    return (this.get('error') && this.get('error').length && this.get('showErrors'));
  }),
  hasIcon: computed('icon', function () {
    return this.get('icon') !== '';
  }),
  icon: "",
  passwordVisible: false,
  textAreaChangedObserver: observer('value', function () {
    let element = this.get('element');

  }),
  actions: {
    togglePasswordVisible() {
      let element = this.get('element');
      let input = __slice(element.getElementsByClassName('input-element'))[ 0 ];

        this.set('passwordVisible',!this.get('passwordVisible'));

      input.focus();

    },
    copyField( e ) {
      let element = this.get('element');
      let copyNode = document.getElementById('copyNode');

      e.preventDefault();
      e.stopPropagation();
        copyNode.textContent = this.get('value');

      // "Optional" Select some text
      let range = document.createRange();
      range.selectNodeContents(document.getElementById('copyNode'));
      let sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);

      // Use try & catch for unsupported browser
      try {

        // The important part (copy selected text)
        let successful = document.execCommand('copy');

        // "Optional" remove selected text
        //     sel.removeAllRanges();
        //   copyNode.innerText = '';
        if ( successful ) {

          this.sendAction('attrs.on-copied', 'success');

          /*  self.notifications.info(self.get('i18n').t("Common.Messages.FieldCopied"), {
           autoClear: true,
           clearDuration: 3000
           });*/

        }

        else {

          this.sendAction('attrs.on-copied', 'failed');

          /*self.notifications.error(self.get('i18n').t("Common.Messages.FieldNotCopied"), {
           autoClear: true,
           clearDuration: 3000
           });*/
        }
      } catch ( err ) {

        this.sendAction('attrs.on-copied', 'failed');
        /*
         self.notifications.info(self.get('i18n').t('Common.Messages.ManualCopyInstructions'), {
         autoClear: true,
         clearDuration: 3000
         });
         */
      }

    }
  },
  inputClasses: computed('inputClass', 'isMemo', 'readOnly', function () {
    let used = (this.get('value') || (this.get('isMemo') && this.get('readonly'))) ? ' used' : 'not-used';
    return this.get('inputClass') + " " + used + ' input-element';
  }),

  _inView:null,
  willDestroyElement: function () {

    this._super(...arguments);
    /*    let gestures = this.get('gestures');
        let icon = this.$('.icon').get(0);
        if ( this.get('type') === 'memo' ) {
          try {
            autosize.destroy(this.$('textarea'));
          }
          catch(e){

          }

        }
        if ( icon ) {
          gestures.removeEventListener(icon, 'down', this._down);
          gestures.removeEventListener(icon, 'up', this._up);
        }*/
    let element = this.get('element');
    let input = element.getElementsByClassName('input-element')[ 0 ];

    if(input) {
      input.removeEventListener('blur', this._blur);
      input.removeEventListener('focus', this._focus);
      element.removeEventListener('inview', this._inView);
    }
  },
  didInsertElement: function () {
    let self = this;
    this._super(...arguments);
    let gestures = this.get('gestures');
    let element = this.get('element');
    let input = element.getElementsByClassName('input-element')[ 0 ];


        this._blur = function () {

          next(() => {
            self.set('focusedDescriptionProperty', "");
            self.set('focused', false);
            if ( self.get('value') || (self.get('isMemo') && self.get('readonly')) ) {
              self.set('used', true);
            }
            else {
              self.set('used', false);
            }
          });
        };

        input.addEventListener('blur', this._blur);


        this._focus = function () {
          next(() => {
            self.set('focusedDescriptionProperty', self.get('description'));
            self.set('focused', true);
          });
        };


        input.addEventListener('focus', this._focus);


    this._down = function ( inEvent ) {
      next(()=>{
      inEvent.preventDefault();
      inEvent.stopImmediatePropagation();
      input.focus();
      });
    };
    self._up = function ( e ) {
      next(()=>{
      e.preventDefault();
      e.stopImmediatePropagation();
      });
    };

  scheduleOnce('afterRender', () => {

    });


  }

});
