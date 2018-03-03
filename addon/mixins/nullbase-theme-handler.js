import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';
import each from "lodash/each";
import forIn from "lodash/forIn";
import omit from "lodash/omit";
import bind from "lodash/bind";
export default Mixin.create({
  themeService: service('theme-service'),
  init: function () {
    this._super(...arguments);
    this.insertRule = bind(this.get('themeService').insertRule,this.get('themeService'));
    let self = this;

    let themeSettingsForItem = this.get('themeService').get('themes')[ 0 ][ this.get('className') ];
    each(themeSettingsForItem, function ( item ) {
      let selectorForThemeContext = item.context === 'default' ?  '': '.theme-context-'+item.context;
      forIn(omit(item,['context']), function ( propertyValue, key ) {
          let ruleDef = self.get('properties')[ key ];
          if ( ruleDef ) {
            bind(ruleDef.setGlobalCSSRule, self)(propertyValue,selectorForThemeContext);
          }

      });
    });
  }


});
