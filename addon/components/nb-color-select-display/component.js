/* global $ */
import { run, scheduleOnce } from '@ember/runloop';

import { computed } from '@ember/object';
import { equal, bool } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';
import ThemedComponent from 'nullbase-core/mixins/nb-themed-component';

import isString from "lodash/isString";
import isArray from 'lodash/isArray';
import join from 'lodash/join';

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
  tagName: 'nb-color-select-display',
  type: "text",
  isMemo: equal('type', 'memo'),
  error: false,
  errorString: computed('error', function () {
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
    let icon =this.$('.icon').get(0);
    if (  icon ) {
      gestures.removeEventListener(icon, 'down', this._down);
      gestures.removeEventListener(icon, 'up', this._up);
    }
  },
  didInsertElement: function () {
    var self = this;
    this._super(...arguments);
    let gestures = this.get('gestures');
    $('.select-display', self.get('element')).on('blur', function () {
      run(function () {
        self.set('focusedDescriptionProperty', "");
        self.set('focused', false);
        $('.bottom-bar', self.get('element')).removeClass('focused');
        if ( !$('.select-display', self.get('element')).val() ) {
          $('label:first-of-type', self.get('element')).removeClass('active');
        }

        else {
          $(this).removeClass('used');
        }

      });


    });
    $('.select-display', self.get('element')).on('focus', function () {
      run(function () {
        self.set('focusedDescriptionProperty', self.get('description'));
        self.set('focused', true);
        $('.bottom-bar', self.get('element')).addClass('focused');

      });


    });


    this._down = function ( inEvent ) {

      inEvent.preventDefault();
      inEvent.stopImmediatePropagation();
      $('.select-display', self.get('element')).focus();

    };
    self._up = function ( e ) {
      e.preventDefault();
      e.stopImmediatePropagation();
    };

    scheduleOnce('afterRender', function () {
      if ( $('.icon', self.get('element')).get(0) ) {
        gestures.addEventListener($('.icon', self.get('element')).get(0), 'down', self._down);
        gestures.addEventListener($('.icon', self.get('element')).get(0), 'up', self._up);
      }
    });


  }

});
