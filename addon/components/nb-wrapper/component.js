import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
  layout,
  gestures: Ember.inject.service(),
  classNames: [ 'nb-wrapper' ],

  keyPress( e ) {
    var key = e.which || e.keyCode;
    if ( key === 13 || key === 32) {
      e.stopPropagation();
      e.preventDefault();
      this.send("tap",e);
    }
  },
  keyDown( e ) {
    var key = e.which || e.keyCode;
    var self = this;


    if ( key === 13 || key === 32) {
      e.stopPropagation();

      let $element = this.$();
        let $ink = this.$('.ink');

      if ( !self.get('disabled') ) {
        $element.addClass('pressed');
        if ( !self.get('disabled') && self.get('ink') ) {
          $ink.addClass('inkDefaultColor');
        }

        if ( self.get('ink') ) {

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
    if ( key === 13 || key === 32) {
      e.stopPropagation();

      let $element = this.$();

      let $ink = this.$('.ink');
      let self = this;
      $element.removeClass('pressed');

      if ( self.get('ink') ) {
        $ink.removeClass('animate');
      }
      if ( !self.get('disabled') ) {

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
  _tap: null,
  _down: null,
  _up: null,
  _bodyUp: null,
  ink: true,
  attributeBindings: [ "title","tabindex" ],
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
      self.set('pressed',false);
      if ( self.get('ink') ) {
        $ink.removeClass('animate');
      }
    };
    this._bodyKeyUp = function ( /*event*/ ) {
      document.removeEventListener('keyup', self._bodyKeyUp, true);
      $element.removeClass('pressed');
      self.set('pressed',false);
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


      if ( !self.get('disabled') ) {
        $element.addClass('pressed');

        if ( self.get('ink') ) {
          if ( !$ink.width() && !$ink.height() ) {
            let max = Math.max($element.outerWidth(), $element.outerHeight());
            $ink.css({ width: max + 'px', height: max + 'px' });
          }

          let x = event.pageX - $element.offset().left - $ink.width() / 2;
          let y = event.pageY - $element.offset().top - $ink.height() / 2;
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
      if ( !self.get('disabled') ) {

        $element.removeClass('pressed');
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


    if ( self.get('useNativeClick') ) {
      $element.on('click', function ( event ) {
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
