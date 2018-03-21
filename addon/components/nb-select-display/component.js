/* global $ */
import { run, scheduleOnce } from '@ember/runloop';

import { computed } from '@ember/object';
import { equal, bool } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';
import ThemedComponent from 'nullbase-core/mixins/nb-themed-component';

//import _ from "npm:lodash";

var uniqID = {
  counter: 0,
  get: function ( prefix ) {
    if ( !prefix ) {
      prefix = "uniqid";
    }
    var id = prefix + "" + uniqID.counter++;
    if ( $("#" + id).length === 0 ) {
      return id;
    }
    else {
      return uniqID.get();
    }

  }
};
export default Component.extend(ThemedComponent, {
  gestures: service(),
  layout: layout,

  _themeProperties: [
    'attrs.focused-underline-color',
    'attrs.underline-color',
    'attrs.underline-error-color',
    'attrs.focused-underline-error-color',
    'attrs.focused-label-color',
    'attrs.label-color',
    'attrs.error-label-color',
    'attrs.focused-error-label-color',
    'attrs.text-color',
    'attrs.error-text-color',
    'attrs.hint-text-color'
  ],
  tagName: 'nb-select-display',
  type: "text",
  isMemo: equal('type', 'memo'),
  error: false,
  errorString: computed('error', function () {
    if ( this.get("showErrors") ) {
      if ( _.isString(this.get('error')) ) {
        return this.get('error');
      }
      if ( _.isArray(this.get('error')) ) {
        return _.join(this.get('error'), ', ');
      }
    }
    return "";
  }),
  display:"bob",
  value:"bob",
  showErrors: false,
  monospace: false,
  classNames: [],
  classNameBindings: [ 'hasIcon:icon', 'monospace:monospace', 'hasText:has-text:no-text', 'focused:focused:not-focused', 'hasLabel:has-label:no-label', 'hasError:has-error:no-error' ],

  hasText: bool('value'),
  hasLabel: bool('label'),
  description: "",
  focusedDescriptionProperty: "",
  hasError: computed('error', 'showErrors', function () {
    return (this.get('error') && this.get('error').length && this.get('showErrors'));
  }),
  hasIcon: computed('icon', function () {
    return this.get('icon') !== '';
  }),
  icon: "",


  actions: {

  },
  inputClasses: computed('inputClass', function () {
    var used = (this.get('value') || (this.get('isMemo') && this.get('readonly'))) ? ' used' : '';
    return this.get('inputClass') + used;
  }),

  willDestroyElement: function () {
    this._super(...arguments);
    let gestures = this.get('gestures');
    let icon =this.get('element').getElementsByClassName('icon')[0];
    if (  icon ) {
      gestures.removeEventListener(icon, 'down', this._down);
      gestures.removeEventListener(icon, 'up', this._up);
    }
  },
  didInsertElement: function () {
    var self = this;
    this._super(...arguments);
    let gestures = this.get('gestures');

    this.get('element').getElementsByClassName('select-display')[0].addEventListener('blur', function () {
      run(function () {
        self.set('focusedDescriptionProperty', "");
        if(!self.get('isDestroyed'))
        self.set('focused', false);

        self.get('element').getElementsByClassName('bottom-bar')[0].classList.remove('focused');
    /*    if ( !$('.select-display', self.get('element')).val() ) {
          $('label:first-of-type', self.get('element')).removeClass('active');
        }*/

     /*   else {
          this.classList.remove('used');
        }*/

      });


    });
    this.get('element').getElementsByClassName('select-display')[0].addEventListener('focus', function () {
      run(function () {
        self.set('focusedDescriptionProperty', self.get('description'));
        self.set('focused', true);

        self.get('element').getElementsByClassName('bottom-bar')[0].classList.add('focused');

      });


    });


    this._down = function ( inEvent ) {

      inEvent.preventDefault();
      inEvent.stopImmediatePropagation();

      self.get('element').getElementsByClassName('select-display')[0].focus();


    };
    self._up = function ( e ) {
      e.preventDefault();
      e.stopImmediatePropagation();
    };

    scheduleOnce('afterRender', function () {
      if ( self.get('element').getElementsByClassName('icon')[0] ) {
        gestures.addEventListener(self.get('element').getElementsByClassName('icon')[0], 'down', self._down);
        gestures.addEventListener(self.get('element').getElementsByClassName('icon')[0], 'up', self._up);
      }
    });


  }

});
