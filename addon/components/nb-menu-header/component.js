import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
    layout,
    gestures: service(),
    classNames: [ 'nb-menu-header', 'item' ],
    classNameBindings:['hover','focused'],
    attributeBindings:['tabindex',"title"],
    tabindex:-1,
    hover:false,
    focused:false,
    icon: ["",""],
    actions: {
        tap(){
            this.parentView.send('remove');
            this.sendAction("attrs.on-tap");
        }
    },
    willDestroyElement(){
        let gestures = this.get('gestures');
        gestures.removeEventListener(this.get('element'),"down",this._down);
        gestures.removeEventListener(this.get('element'),"tap",this._tap);


    },
    didInsertElement(){

        this._down = function ( event ) {
            event.preventDefault();
          event.stopPropagation();
            event.stopImmediatePropagation();
            //    $element.addClass('hover');

        };
        this.get("gestures").addEventListener(this.get("element"), 'down', this._down);


        this._tap = function ( event ) {
            event.preventDefault();
            event.stopPropagation();

        };
        this.get("gestures").addEventListener(this.get("element"), 'tap', this._tap);



    }
});
