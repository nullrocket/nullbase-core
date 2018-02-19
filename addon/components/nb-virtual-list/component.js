import {computed, observer} from "@ember/object";
import {on} from "@ember/object/evented";
import {once} from "@ember/runloop";
import {A} from "@ember/array"
import layout from './template';
import take from 'lodash/take';
import clone from 'lodash/clone';
import isFinite from 'lodash/isFinite';
import NBScrollPanel from 'nullbase-core/components/nb-scroll-panel/component';
import AnimationFrameQueue from '../../utils/animation-frame-queue';


function makeRAFJS( updates, self, itemHeight, itemContentProperty, items, scrollTop, contentElement ) {
  return function () {

    contentElement.style[ "transform" ] = 'translate3d(0px, ' + (-(scrollTop)) + 'px, 0)';

    var childComponents = self ? self.get('childComponentsX') : undefined;

    if ( childComponents ) {
      let updatesLength = updates.length;
      for ( let i = 0; i < updatesLength; i++ ) {
        if ( childComponents[ updates[ i ][ 1 ] ] && !childComponents[ updates[ i ][ 1 ] ].get('isDestroyed') ) {
          childComponents[ updates[ i ][ 1 ] ].get('element').style[ "transform" ] = 'translate3d(0px, ' + (updates[ i ][ 0 ] * itemHeight) + 'px, 0)';

        }
      }

      setImmediate(() => {
        for ( let i = 0; i < updatesLength; i++ ) {
          if ( childComponents[ updates[ i ][ 1 ] ] && !childComponents[ updates[ i ][ 1 ] ].get('isDestroyed') ) {
            childComponents[ updates[ i ][ 1 ] ].set(itemContentProperty, items[ updates[ i ][ 0 ] ]);
          }

        }
      });


    }
  };
}


function makeRAF( updates, self, itemHeight, itemContentProperty, items) {

  return function () {


    let childComponents = self ? self.get('childComponentsX') : undefined;

    if ( childComponents && childComponents.length ) {
      for ( let i = 0; i < updates.length; i++ ) {

        if ( childComponents[ updates[ i ][ 1 ] ] && !childComponents[ updates[ i ][ 1 ] ].get('isDestroyed') ) {

          childComponents[ updates[ i ][ 1 ] ].get('element').style[ "transform" ] = 'translate3d(0px, ' + (updates[ i ][ 0 ] * itemHeight) + 'px, 0) scale(1)';


        }

      }
    //  setImmediate(function () {


        for ( let i = 0; i < updates.length; i++ ) {

          if ( childComponents[ updates[ i ][ 1 ] ] && !childComponents[ updates[ i ][ 1 ] ].get('isDestroyed') ) {
            childComponents[ updates[ i ][ 1 ] ].set(itemContentProperty, items[ updates[ i ][ 0 ] ]);


          }
        }

   //   });
    }

  };
}

export default NBScrollPanel.extend({
  layout,
  init() {

    if ( !this.get('args') ) {
      this.set('args', {});
    }
    this.set('_AFQ_VIRTUAL_LIST', new AnimationFrameQueue());
    this.set('renderedComponents', A([]));
    this.set('childComponentsX', A([]));
    this._super(...arguments);
  },
  _AFQ_VIRTUAL_LIST: null,
  _onRender( scrollLeft, scrollTop ) {
    let self = this;
    let ren = this;

    //   setImmediate(function () {
    if ( !self.get('isDestroyed') && isFinite(scrollTop) ) {
      self.set('scrollTop', scrollTop);
      let itemHeight = self.get('itemHeight');
      let itemCount = self.get('items') ? self.get('items').length : 0;
      let element = self.get('element');
      let contentElement = element.getElementsByClassName('scroll-panel-content')[ 0 ];

      let firstInView = ((Math.floor(scrollTop / itemHeight) - 10) > 0) ? (Math.floor(scrollTop / itemHeight) - 10) : 0;
      ren.updates = [];
      let childViewLength = self.get('childComponentsX').length;
      let i;
      let loopCounterCache = Math.min(firstInView + childViewLength, itemCount);
      for ( i = firstInView; i < loopCounterCache; i++ ) {
        ren.updates.push([ i, i % childViewLength ]);
      }

      self.get('_AFQ_VIRTUAL_LIST').clear();
      let raf = makeRAFJS(ren.updates, self, itemHeight, self.get('delayedProp'), self.get('items'), scrollTop, contentElement);
      //  window.requestAnimationFrame(raf);
      self.get('_AFQ_VIRTUAL_LIST').add(raf);
    }
    //   });

  },
  _onNativeRender( scrollLeft, scrollTop ) {
    let self = this;
    let ren = this;

       setImmediate(function () {
    if ( !self.get('isDestroyed') && isFinite(scrollTop) ) {

      let itemHeight = self.get('itemHeight');
      let itemCount = self.get('items') ? self.get('items').length : 0;


      let firstInView = ((Math.floor(scrollTop / itemHeight)) > 0) ? (Math.floor(scrollTop / itemHeight)) - 50 : 0;
      ren.updates = [];
      let childViewLength = self.get('childComponentsX').length;
      let i;
      let loopCounterCache = Math.min(firstInView + childViewLength, itemCount);
      for ( i = firstInView; i < loopCounterCache; i++ ) {
        ren.updates.push([ i, i % childViewLength ]);
      }

      self.get('_AFQ_VIRTUAL_LIST').clear();
      let raf = makeRAF(ren.updates, self, itemHeight, self.get('itemContentProperty'), self.get('items'));
      self.get('_AFQ_VIRTUAL_LIST').add(raf);
     //      window.requestAnimationFrame(raf);

    }

      });

  },
  items: null,
  itemHeight: null,
  itemComponent: null,
  delayedProp: null,
  renderedComponentsDidChange: on('init', observer('items', 'items.[]', 'height', 'width', 'updateTrigger', function () {
    once(this, 'processRenderedComponentsChange');
  })),

  processRenderedComponentsChange() {

    let self = this;

    let raf = null;
    let height = self.get('height');
    let itemCount = self.get('items') ? self.get('items').length : 0;
    let itemHeight = self.get('itemHeight');
    let requiredItemCount = 0;
    let element = this.get('element');
    if ( itemCount < 100 ) {
      requiredItemCount = Math.min(itemCount, Math.ceil(height / itemHeight) + 100);
    }
    else {
      requiredItemCount = Math.min(itemCount, Math.ceil(height / itemHeight) + 100);
    }

    let childViewCount = self.get('renderedComponents').length;
    let scrollTop = self.get('scrollTop');

    if ( requiredItemCount < childViewCount ) {
      self.set('renderedComponents', A(take(self.get('renderedComponents'), requiredItemCount)));
    }

    //   setImmediate(function(){
    let objects = [];

    for ( let i = childViewCount; i < requiredItemCount; i++ ) {
      objects.push(self.get('itemComponent'));

    }
    self.get('renderedComponents').pushObjects(objects);

    let firstInView = ((Math.floor(scrollTop / itemHeight) ) > 0) ? (Math.floor(scrollTop / itemHeight) - 50) : 0;

    let updates = [];
    let childViewLength = self.get('renderedComponents').length;

    let x = Math.min((firstInView ) + childViewLength, itemCount);
    for ( let i = firstInView; i < x; i++ ) {
      updates.push([ i, i % childViewLength ]);
    }

    if ( self.get('useNativeScroll') === false ) {
      element.getElementsByClassName('scroll-panel-content')[ 0 ].style.top = 0;
      element.getElementsByClassName('scroll-panel-content')[ 0 ].style.height = Math.max(itemCount * self.get('itemHeight'), self.get('height')) + 'px';


      if ( self.get('scrollBar') ) {

        //    width = $(this.get('element')).width($(this.get('element')).parent().width() - 30).width();


        if ( height > Math.max(itemCount * self.get('itemHeight')) ) {
          //   $('.item-container', self.get('element')).parent().addClass('hide-scrollbars');
        }
        else {
          //     $('.item-container', self.get('element')).parent().removeClass('hide-scrollbars');
        }

      }
      else {
        //     width = $(this.get('element')).parent().width();
      }


      if ( self.get('scroller') ) {


        self.get('scroller').setDimensions(null, height, null, Math.max(itemCount * self.get('itemHeight')));
      }

      self.get('_AFQ_VIRTUAL_LIST').clear();

      raf = makeRAF(updates, self, itemHeight, self.get('delayedProp'), self.get('items'));

      self.get('_AFQ_VIRTUAL_LIST').add(raf);
      //  window.requestAnimationFrame(raf);


    }
    else {
      element.getElementsByClassName('scroll-panel-content')[ 0 ].style[ "transform" ] = 'translate3d(0px, 0px, 0)';
      element.getElementsByClassName('scroll-panel-content')[ 0 ].style.height = Math.max(itemCount * self.get('itemHeight'), self.get('height')) + 'px';
      //   self.get('_AFQ_VIRTUAL_LIST').clear();
      raf = makeRAF(updates, self, itemHeight, self.get('delayedProp'), self.get('items'));

      //self.get('_AFQ_VIRTUAL_LIST').add(raf);
       window.requestAnimationFrame(raf);

    }


  }
});
