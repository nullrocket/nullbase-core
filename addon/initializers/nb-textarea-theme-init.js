import EmberObject from '@ember/object';
import ThemeHandlerMixin from 'nullbase-core/mixins/nullbase-theme-handler';

var ThemeHandler = EmberObject.extend(ThemeHandlerMixin, {

  className: 'nb-textarea',
  _insertedStyles: [],
  properties: {

    'focused-border-color': {
      setGlobalCSSRule( color, selectorForThemeContext ){
          let rule = `nb-textarea${selectorForThemeContext}.focused textarea { 
                      border:1px solid ${color};
                      }`;

          this.insertRule(rule, this);
      },

      setInstanceCSSRule(){
        let elementId = this.get('elementId');
        let color = this.get('attrs.focused-border-color');
        let rule = `#${elementId}.focused textarea { 
                      border:1px solid ${color};
                      }`;
        this.insertRule(rule, this);
      }

    },
    'focused-border-error-color': {
      setGlobalCSSRule( color, selectorForThemeContext ){
        let rule = `nb-textarea${selectorForThemeContext}.has-error textarea { 
                      border:1px solid ${color};
                      }`;

        this.insertRule(rule, this);
      },

      setInstanceCSSRule(){
        let elementId = this.get('elementId');
        let color = this.get('attrs.focused-border-color');
        let rule = `#${elementId}.has-error textarea { 
                      border:1px solid ${color};
                      }`;
        this.insertRule(rule, this);
      }

    },
    'border-error-color': {
      setGlobalCSSRule( color, selectorForThemeContext ){
        let rule = `nb-textarea${selectorForThemeContext}.has-error textarea { 
                      border:1px solid ${color};
                      }`;

        this.insertRule(rule, this);
      },

      setInstanceCSSRule(){
        let elementId = this.get('elementId');
        let color = this.get('attrs.border-error-color');
        let rule = `#${elementId}.has-error textarea { 
                      border:1px solid ${color};
                      }`;
        this.insertRule(rule, this);
      }

    },
    'border-color': {
      setGlobalCSSRule( color, selectorForThemeContext ){
        let rule = `nb-textarea${selectorForThemeContext} textarea { 
                      border:1px solid ${color};
                      }`;

        this.insertRule(rule, this);

        //});
      },

      setInstanceCSSRule(){
        let elementId = this.get('elementId');
        let color = this.get('attrs.focused-underline-color');
        let rule = `#${elementId} textarea { 
                      border:1px solid ${color};
                      }`;
        this.insertRule(rule, this);
      }

    },
    'focused-label-color': {
      setGlobalCSSRule( color, selectorForThemeContext ){
        let rule = `nb-textarea${selectorForThemeContext}.focused .label { 
                      color:${color};
                      }`;

        this.insertRule(rule, this);
        //});
      },

      setInstanceCSSRule(){
        let elementId = this.get('elementId');
        let color = this.get('attrs.focused-label-color');
        let rule = `#${elementId}.focused .label { 
                      color:${color};
                      }`;
        this.insertRule(rule, this);
      }

    },
    'label-color': {
      setGlobalCSSRule( color, selectorForThemeContext ){
         let rule = `nb-textarea${selectorForThemeContext}.not-focused .label { 
                      color:${color};
                      }`;

        this.insertRule(rule, this);
       },

      setInstanceCSSRule(){
        let elementId = this.get('elementId');
        let color = this.get('attrs.label-color');
        let rule = `#${elementId}.not-focused .label { 
                      color:${color};
                      }`;
        this.insertRule(rule, this);
      }

    },
    'error-label-color': {
      setGlobalCSSRule( color, selectorForThemeContext ){
        let rule = `nb-textarea${selectorForThemeContext}.not-focused.has-error .label { 
                      color:${color};
                      }`;

        this.insertRule(rule, this);
        //});
      },

      setInstanceCSSRule(){
        let elementId = this.get('elementId');
        let color = this.get('attrs.error-label-color');
        let rule = `#${elementId}.not-focused.has-error .label { 
                      color:${color};
                      }`;
        this.insertRule(rule, this);
      }

    },
    'focused-error-label-color': {
      setGlobalCSSRule( color, selectorForThemeContext ){
        let rule = `nb-textarea${selectorForThemeContext}.focused.has-error .label { 
                      color:${color};
                      }`;
        this.insertRule(rule, this);
      },

      setInstanceCSSRule(){
        let elementId = this.get('elementId');
        let color = this.get('attrs.focused-error-label-color');
        let rule = `#${elementId}.focused.has-error .label { 
                      color:${color};
                      }`;
        this.insertRule(rule, this);
      }

    },
    'text-color': {
      setGlobalCSSRule( color, selectorForThemeContext ){
                let rule = `nb-textarea${selectorForThemeContext} input, nb-textarea${selectorForThemeContext} textarea  { 
                      color:${color};
                      }`;

        this.insertRule(rule, this);

      },

      setInstanceCSSRule(){
        let elementId = this.get('elementId');
        let color = this.get('attrs.text-color');
        let rule = `#${elementId} input , #${elementId} textarea{ 
                      color:${color};
                      }`;
        this.insertRule(rule, this);
      }

    },
    'error-text-color': {
      setGlobalCSSRule( color, selectorForThemeContext ){
        let rule = `nb-textarea${selectorForThemeContext} .error  { 
                      color:${color};
                      }`;

        this.insertRule(rule, this);
      },

      setInstanceCSSRule(){
        let elementId = this.get('elementId');
        let color = this.get('attrs.text-color');
        let rule = `#${elementId} .error { 
                      color:${color};
                      }`;
        this.insertRule(rule, this);
      }

    },
    'hint-text-color': {
      setGlobalCSSRule( color, selectorForThemeContext ){

        let rule = `nb-textarea${selectorForThemeContext} .hint-text  { 
                      color:${color};
                      }`;

        this.insertRule(rule, this);

      },

      setInstanceCSSRule(){
        let elementId = this.get('elementId');
        let color = this.get('attrs.hint-text-color');
        let rule = `#${elementId} .hint-text { 
                      color:${color};
                      }`;
        this.insertRule(rule, this);
      }

    },


  }
});


export function initialize( application ) {

  application.register('nb-textarea-theme-init:main', ThemeHandler, { instantiate: true });
  application.inject('component:nb-textarea', '_themeHandler', 'nb-textarea-theme-init:main');
}

export default {
  after: 'theme-service-initializer',
  name: 'nb-textarea-theme-init',
  initialize
};
