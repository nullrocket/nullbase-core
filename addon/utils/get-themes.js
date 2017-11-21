import Ember from 'ember';

const matchKey = '/themes/(.+)/theme$';

export default function getThemes() {
  return Object.keys(requirejs.entries)
               .reduce(( themes, module ) => {

                 var match = module.match(matchKey);
                 if ( match ) {
                   themes.pushObject(requirejs(module).default);
                 }
                 return themes;
               }, Ember.A())
               .sort();
}
