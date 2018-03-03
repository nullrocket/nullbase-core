import {later} from '@ember/runloop';
import Component from '@ember/component';
import layout from './template';

import series from 'nullbase-core/neo-async-es/series';
import {nextTick} from "nullbase-core/neo-async-es/ticks";
import extend from "lodash/extend";
import {inject as service} from '@ember/service';

export default Component.extend({
  layout,
  gestures: service(),
  classNames: [ 'nb-menu' ],
  classNameBindings: [ 'elevation' ],

  elevation: 'elevation-6dp',
  attributeBindings: [ 'tabindex' ],
  tabindex: -1,
  options: '',

  actions: {
    remove() {

      this.parentView.send("remove");
    }
  }
  ,
  willDestroyElement() {


    let gestures = this.get('gestures');
    gestures.removeEventListener(this.get('element'), 'down', this._down);
    this.get('element').classList.remove('pre-show');
    this.get('element').classList.remove('show');
    this.get('element').removeEventListener('keyup', this._keyup);
    this.get('element').removeEventListener('keydown', this._keydown);
    window.removeEventListener('resize', this.resize);
    this._super(...arguments);
  }
  ,

  didInsertElement() {

    this._down = function ( e ) {


    };

    //  this.get('gestures').addEventListener(this.get("element"), "down", this._down);
    this._super(...arguments);
    let self = this;
    this.get('element').classList.add('pre-show');
    this.get('element').classList.remove('show');
    this.get('element').classList.remove('anims');

    var options = null;
    series([ function ( callback ) {

      if ( self.get('tether') ) {
        //  let width = self.$().outerWidth();
        //  let h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        let w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        var pos = $(self.get('tether')).offset();

        //        var side = (pos.left < (w / 2)) ? "left" : "right";
        let side = 'left';
        $(self.get('element')).addClass('expand-' + side);

        options = {
          element: self.get('element'),
          target: self.get('tether'),
          attachment: 'top ' + side,
          targetAttachment: 'bottom ' + side,
          targetOffset: "2px 0 ",
          optimizations: {

            gpu: true
          },
          constraints: [
            {
              //to: [ 2, 2, $('body').width() - 2, $('body').height() - 2  ],   //''scrollParent',
              to: [ 0, 0, $('body').width(), $('body').height() ],   //''scrollParent',
              attachment: 'both',
              pin: true
            }
          ]
        };


        var tetherObject = new Tether(options);
        self.set('parentView.tetherObject', tetherObject);

      }


      $(self.get('element')).removeClass('pre-show');
      $(self.get('element')).addClass('anims');

      callback();


    }, function ( callback ) {
      nextTick(function () {
        callback();
        later(function () {
          $(self.get('element')).addClass('show');
          self.get('options.owner').set('open', true);


        }, 30);

      })


    } ], function () {});


    this.resize = function () {
      if ( !self.get('isDestroying') ) {

        let width = self.$().outerWidth();
        let h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        let w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        let pos = $(self.get('tether')).offset();

        let side = (pos.left < (w / 2)) ? "left" : "right";

        $(self.get('element')).addClass('expand-' + side);

        self.get('parentView.tetherObject').setOptions(extend(options, {
          constraints: [
            {
              to: [ 2, 2, $('body').width() - 2, $('body').height() - 2 ],   //''scrollParent',
              attachment: 'both',
              pin: true
            }
          ]
        }));
      }
    };
    $(window).on('resize', this.resize);


    this.get('element').focus();


    this.$().on('keydown', function ( evt ) {
      var key = evt.which || evt.keyCode;

      if ( key !== 9 && key !== 27 && key !== 38 && key !== 40 ) {

        evt.stopPropagation();
      }
      if ( key === 27 ) {
        self.get('element').focus();
        self.send('remove');
      }


      // up arrow
      if ( key === 38 ) {
        evt.preventDefault();
        evt.stopPropagation();


        $(':tabbable.item:last', $(this).parent().get(0)).focus();

      }
      // down arrow
      if ( key === 40 ) {
        $(':tabbable.item:first', $(this).parent().get(0)).focus();

      }

    });


  }
});
