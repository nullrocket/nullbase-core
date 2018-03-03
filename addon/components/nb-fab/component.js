import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';
import ThemedComponent from 'nullbase-core/mixins/nb-themed-component';


export default Component.extend(ThemedComponent, {
    layout,
    gestures: service(),
    tagName: "div",
    classNames: [ 'nb-fab' ],

    classNameBindings: [ 'disabled:disabled', 'type', 'size', "pressed:pressed", "active:active" ],
    active: "",
    actions: {
        activate(){
            this.sendAction('attrs.on-activate');
        }
    },
    willDestroyElement(){
        this.get('gestures').removeEventListener(document, 'down', this._bodyDown, true);
    },
    didInsertElement(){
        this._super(...arguments);
        let self = this;
        this._bodyDown = function ( event ) {
            if ( self.get('active') && !$.contains(self.get('element'), event.target) ) {
                self.send('activate');
            }
        };
        let gestures = this.get('gestures');
        gestures.addEventListener(document, 'down', self._bodyDown, true);
    }

});
