var MenuManager = {};

export function initialize( application ) {

  application.register('menuManager:main', MenuManager, {instantiate: false});
  application.inject('route', 'menuManager', 'menuManager:main');

  application.inject('component', 'menuManager', 'menuManager:main');
  //application.inject('controller', 'menuManager', 'menuManager:main');
  application.menuManager = application.__container__.lookup('menuManager:main');
  
}

export default {
  name: 'nb-menu-manager',
  initialize
};
