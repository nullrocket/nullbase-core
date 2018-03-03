import { computed } from '@ember/object';
import Service from '@ember/service';
import each from "lodash/each";
import findIndex from "lodash/findIndex";
import bind from "lodash/bind";
import trim from "lodash/trim";
import getThemes from "../utils/get-themes";

export function initialize( application ) {

  var themeService = Service.extend({
    themes: computed(getThemes),
    init(){
      this._super(...arguments);

    },
    initThemesForComponent( component ){
      //  console.log(Object.keys(component));
      //  console.log('initThemeForComponent',component);
    },
    setInstanceCSSRuleProperty( property, instance ){
      bind(instance.get('_themeHandler.properties')[ property ].setInstanceCSSRule, instance)();
    },

    insertRule( rule, instance ){
      try {
        if ( document.styleSheets[ document.styleSheets.length - 1 ].cssRules ) {
          let index = document.styleSheets[ document.styleSheets.length - 1 ].cssRules.length;
          document.styleSheets[ document.styleSheets.length - 1 ].insertRule(rule, index);
          instance.get('_insertedStyles').push(this.getRuleSelector(rule));
        }
      }
      catch(e){

      }

    },
    deleteInstanceRules( instance ){
      try {
        if ( document.styleSheets[ document.styleSheets.length - 1 ].cssRules ) {
          each(instance.get("_insertedStyles"), function ( selectorText ) {
            var index = findIndex(document.styleSheets[ document.styleSheets.length - 1 ].cssRules, function ( cssRule ) {

              return cssRule.selectorText === selectorText;
            });
            //console.log(index);
            if ( index >= 0 ) {
              document.styleSheets[ document.styleSheets.length - 1 ].deleteRule(index);
            }
          });
          instance.set("_insertedStyles", []);
        }
      }
      catch(e){

      }

    },
    getRuleSelector( rule ){
      return trim(rule.split("{")[ 0 ].replace(/\s\s+/g, ' '));
    }
  });
  application.register('service:theme-service', themeService, { instantiate: true });
  // application.inject('route', 'foo', 'service:foo');
}

export default {
  name: 'theme-service-initializer',
  initialize
};
