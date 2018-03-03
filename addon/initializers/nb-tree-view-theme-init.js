
import EmberObject from '@ember/object';
import ThemeHandlerMixin from 'nullbase-core/mixins/nullbase-theme-handler';
var ThemeHandler = EmberObject.extend(ThemeHandlerMixin, {

  className: 'nb-tree-view',
  _insertedStyles: [],
  properties: {

    'focused-underline-color': {
      setGlobalCSSRule( color, selectorForThemeContext ){
          let rule = `nb-select-display${selectorForThemeContext} .bottom-bar:before, nb-select-display${selectorForThemeContext} .bottom-bar:after { 
                      background:${color};
                      }`;

          this.insertRule(rule, this);
      },

      setInstanceCSSRule(){
        let elementId = this.get('elementId');
        let color = this.get('attrs.focused-underline-color');
        let rule = `#${elementId} .bottom-bar:before, #${elementId} .bottom-bar:after { 
                      background:${color};
                      }`;
        this.insertRule(rule, this);
      }

    },
    'focused-underline-error-color': {
      setGlobalCSSRule( color, selectorForThemeContext ){
        let rule = `nb-select-display${selectorForThemeContext}.has-error .bottom-bar:before, nb-select-display${selectorForThemeContext}.has-error .bottom-bar:after { 
                      background:${color};
                      }`;

        this.insertRule(rule, this);
      },

      setInstanceCSSRule(){
        let elementId = this.get('elementId');
        let color = this.get('attrs.focused-underline-color');
        let rule = `#${elementId}.has-error .bottom-bar:before, #${elementId} .bottom-bar:after { 
                      background:${color};
                      }`;
        this.insertRule(rule, this);
      }

    },
    'underline-error-color': {
      setGlobalCSSRule( color, selectorForThemeContext ){
        let rule = `nb-select-display${selectorForThemeContext}.has-error .bottom-bar { 
                      background:${color};
                      }`;

        this.insertRule(rule, this);
      },

      setInstanceCSSRule(){
        let elementId = this.get('elementId');
        let color = this.get('attrs.underline-error-color');
        let rule = `#${elementId}.has-error .bottom-bar { 
                      background:${color};
                      }`;
        this.insertRule(rule, this);
      }

    },
    'underline-color': {
      setGlobalCSSRule( color, selectorForThemeContext ){
        let rule = `nb-select-display${selectorForThemeContext} .bottom-bar { 
                      background:${color};
                      }`;

        this.insertRule(rule, this);

        //});
      },

      setInstanceCSSRule(){
        let elementId = this.get('elementId');
        let color = this.get('attrs.focused-underline-color');
        let rule = `#${elementId} .bottom-bar { 
                      background:${color};
                      }`;
        this.insertRule(rule, this);
      }

    },
    'focused-label-color': {
      setGlobalCSSRule( color, selectorForThemeContext ){
        let rule = `nb-select-display${selectorForThemeContext}.focused .label { 
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
         let rule = `nb-select-display${selectorForThemeContext}.not-focused .label { 
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
        let rule = `nb-select-display${selectorForThemeContext}.not-focused.has-error .label { 
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
        let rule = `nb-select-display${selectorForThemeContext}.focused.has-error .label { 
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
                let rule = `nb-select-display${selectorForThemeContext} input, nb-select-display${selectorForThemeContext} textarea  { 
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
        let rule = `nb-select-display${selectorForThemeContext} .error  { 
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

        let rule = `nb-select-display${selectorForThemeContext} .hint-text  { 
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

  application.register('nb-tree-view-theme-init:main', ThemeHandler, { instantiate: true });
  application.inject('component:nb-tree-view', '_themeHandler', 'nb-tree-view-theme-init:main');
}

export default {
  after: 'theme-service-initializer',
  name: 'nb-tree-view-theme-init',
  initialize
};
