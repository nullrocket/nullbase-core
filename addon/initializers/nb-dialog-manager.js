

import Ember from "ember";

var DialogManager = {};//Ember.Component.extend({





//}).create();


export function initialize( application) {


  application.register('dialogManager:main', DialogManager, {instantiate: false});
  application.inject('controller', 'dialogManager', 'dialogManager:main');
  application.inject('route', 'dialogManager', 'dialogManager:main');
  application.inject('view', 'dialogManager', 'dialogManager:main');
  application.inject('component', 'dialogManager', 'dialogManager:main');

  application.dialogManager = application.__container__.lookup('dialogManager:main');


}


export default {
  name: 'nb-dialog-manager',
  initialize
};
