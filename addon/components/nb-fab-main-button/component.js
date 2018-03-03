import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';
import ThemedComponent from 'nullbase-core/mixins/nb-themed-component';


export default Component.extend(ThemedComponent, {
    layout,
    gestures: service(),
    tagName: "button",
    classNames: [ 'nb-fab-main-button' ],
    classNameBindings: [ 'disabled:disabled', 'type', 'size', "pressed:pressed" ],
    pressed: false,
    elevation: computed('pressed',
        function () {

                if ( this.get('pressed') ) {
                    return 'elevation-16dp';
                }
                else {
                    return 'elevation-8dp'
                }


        }),

    size: '',
    attributeBindings: [ 'touchAction:touch-action', 'disabled:disabled', "title:title" ],
    touchAction: 'none',
    disabled: false,
    useNativeClick: false,
    ink: true,
    type: "normal",//"flat-text" , "raised-text", "flat-icon", "raised-icon"
    icon: "",
    activeIcon:"",
    currentIcon:computed('active',function(){
       return this.get('active')? this.get('activeIcon') :this.get("icon");
    }),
    keyPress( e ) {
        var key = e.which || e.keyCode;
        if ( key === 13 || key === 32 ) {
            e.stopPropagation();
            e.preventDefault();
            this.send("tap", e);
        }
    },
    keyDown( e ) {
        var key = e.which || e.keyCode;
        var self = this;


        if ( key === 13 || key === 32 ) {
            e.stopPropagation();

            let $element = this.$();
            let element = this.get('element');
            let $ink = this.$('.ink');
            let gestures = this.get('gestures');
            if ( !self.get('disabled') ) {

                self.set('pressed', true);

                let $inner = $('.inner', element);


                let display = $inner.css("display");
                if ( display === 'inline' || display === 'inline-block' ) {
                    $inner.css({ display: 'inline-block' });
                }
                else {
                    $inner.css({ display: 'block' });
                }
                if ( !self.get('disabled') && self.get('ink') ) {
                    $ink.addClass('inkColor');
                }

                if ( self.get('ink') ) {
                    if ( !$ink.width() && !$ink.height() ) {
                        let max = Math.max($inner.outerWidth(), $inner.outerHeight());
                        $ink.css({ width: max + 'px', height: max + 'px' });
                    }

                    let x = 0;
                    let y = 0;
                    $ink.css({ top: y + 'px', left: x + 'px' });


                    $ink.addClass('animate');

                }

                document.addEventListener('keyup', self._bodyKeyUp, true);
                self.send("down", e);
            }
        }
    },
    keyUp( e ) {
        var key = e.which || e.keyCode;
        if ( key === 13 || key === 32 ) {
            e.stopPropagation();

            let $element = this.$();
            let element = this.get('element');
            let $ink = this.$('.ink');
            let self = this;
            if ( !self.get('disabled') ) {
                $element.removeClass('pressed');
                self.set('pressed', false);
                if ( self.get('ink') ) {
                    $ink.removeClass('animate');
                }
                self.send("up", e);
            }
        }
    },
    actions: {
        tap(){
            this.sendAction('attrs.on-tap', ...arguments);
        },
        down(){
            this.sendAction('attrs.on-down', ...arguments);
        },
        up(){
            this.sendAction('attrs.on-up', ...arguments);
        }
    },


    willDestroyElement(){
        let element = this.get('element');
        let $element = this.$();
        let removeEventListener = this.get('gestures').removeEventListener;
        removeEventListener(element, 'tap', this._tap);
        removeEventListener(element, 'down', this._down);
        removeEventListener(element, 'up', this._up);
        $element.off('mouseover');
        $element.off('mouseout');
        this._super(...arguments);
    },

    _tap: null,
    _down: null,
    _up: null,
    _bodyUp: null,
    _insertedStyles: [],
    _themeProperties: [
        'attrs.pressed-background-color',
        'attrs.focused-background-color',
        'attrs.pressed-background-color',
        'attrs.focused-background-color',
        'attrs.focused-text-color',
        'attrs.pressed-text-color',
        'attrs.background-color',
        'attrs.ink-color',
        'attrs.text-color'
    ],
    didInsertElement(){
        this._super(...arguments);

        let gestures = this.get('gestures');
        let self = this;
        let $element = this.$();
        let element = this.get('element');
        let $ink = this.$('.ink');


        /**
         *
         * @param event
         * @private
         */
        this._tap = function ( event ) {
            event.preventDefault();

            if ( !self.get('disabled') ) {
                $ink.removeClass('animate');
                self.send("tap", event);
            }
        };


        /**
         *
         * @private
         */
        this._bodyUp = function ( /*event*/ ) {
            gestures.removeEventListener(document, 'up', self._bodyUp, true);
            $element.removeClass('pressed');

            self.set('pressed', false);
            if ( self.get('ink') ) {
                $ink.removeClass('animate');
            }
        };




        this._bodyKeyUp = function ( /*event*/ ) {
            document.removeEventListener('keyup', self._bodyKeyUp, true);
            $element.removeClass('pressed');
            self.set('pressed', false);
            if ( self.get('ink') ) {
                $ink.removeClass('animate');
            }
        };
        /**
         *
         * @param event
         * @private
         */
        this._down = function ( event ) {

            event.preventDefault();
            $element.focus();
            if ( !self.get('disabled') ) {

                self.set('pressed', true);


                let $inner = $('.inner', element);


                let display = $inner.css("display");
                if ( display === 'inline' || display === 'inline-block' ) {
                    $inner.css({ display: 'inline-block' });
                }
                else {
                    $inner.css({ display: 'block' });
                }
                if ( !self.get('disabled') && self.get('ink') ) {
                    $ink.addClass('inkColor');
                }

                if ( self.get('ink') ) {
                    if ( !$ink.width() && !$ink.height() ) {
                        let max = Math.max($inner.outerWidth(), $inner.outerHeight());
                        $ink.css({ width: max + 'px', height: max + 'px' });
                    }

                    let x = event.pageX - $inner.offset().left - $ink.width() / 2;
                    let y = event.pageY - $inner.offset().top - $ink.height() / 2;
                    $ink.css({ top: y + 'px', left: x + 'px' });


                    $ink.addClass('animate');

                }
                gestures.addEventListener(document, 'up', self._bodyUp, true);

                self.send("down", event);
            }
        };


        /**
         *
         * @param event
         * @private
         */
        this._up = function ( event ) {
            event.preventDefault();
            if ( !self.get('disabled') ) {
                $element.removeClass('pressed');
                self.set('pressed', false);
                self.send("up", event);
            }
        };

        $element.on('mouseover', function () {
            if ( !self.get('disabled') ) {
                $element.addClass('hover');

            }
        });

        $element.on('mouseout', function () {
            if ( !self.get('disabled') ) {
                $element.removeClass('hover');
            }
        });
        $element.on('mouseenter', function () {
            if ( !self.get('disabled') ) {
                $element.addClass('hover');
               // self.send("tap");
            }
        });

        $element.on('mouseleave', function () {
            if ( !self.get('disabled') ) {
                $element.removeClass('hover');
             //   self.send("tap");
            }
        });

        if ( self.get('useNativeClick') ) {
            $element.on('click touch', function ( event ) {
                if ( !self.get('disabled') ) {
                    event.preventDefault();
                    event.stopPropagation();
                    self.send('tap', event);
                }
            });
        }
        else {
            gestures.addEventListener(element, 'tap', this._tap);
        }

        gestures.addEventListener(element, 'down', this._down);
        gestures.addEventListener(element, 'up', this._up);
    }
});
