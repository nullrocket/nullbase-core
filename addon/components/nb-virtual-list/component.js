import { observer } from "@ember/object";
import { on } from "@ember/object/evented";
import { once } from "@ember/runloop";
import { A } from "@ember/array"
import layout from './template';
import take from 'lodash/take';
import isFinite from 'lodash/isFinite';

import NBScrollPanel from 'nullbase-core/components/nb-scroll-panel/component';
import AnimationFrameQueue from '../../utils/animation-frame-queue';


function aRAF(){
  let [self, itemHeight, itemContentProperty, items, firstInView, childViewLength, loopCounterCache] = this.get('_args');
  let childComponents = self ? self.get('childComponentsX') : undefined;
  if ( childComponents && childComponents.length ) {
    for ( let i = firstInView; i < loopCounterCache; i++ ) {
      let childViewComponent = childComponents[i%childViewLength];
      if ( childViewComponent && !childViewComponent.get('isDestroyed') ) {
        childViewComponent.get('element').style[ "transform" ] = 'translate3d(0px, ' + (i * itemHeight) + 'px, 0) scale(1)';
        childViewComponent.set(itemContentProperty, items[ i ]);
      }
    }


  }

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
    this.updates = new Array(200);
    this._super(...arguments);
    this._args = [];
    this._raf = aRAF.bind(this);
  },
  _AFQ_VIRTUAL_LIST: null,
  _onRender( scrollLeft, scrollTop ) {

    if ( !this.get('isDestroyed') && isFinite(scrollTop) ) {
      this.set('scrollTop', scrollTop);
      let itemHeight = this.get('itemHeight');
      let itemCount = this.get('items') ? this.get('items').length : 0;
      let height = this.get('height');
      let howManyInWindow = Math.ceil(height / itemHeight);
      let howManyExtra = Math.min(itemCount - howManyInWindow, 100);
      let firstInView = ((Math.floor(scrollTop / itemHeight)) > 0) ? (Math.floor(scrollTop / itemHeight) - Math.ceil(howManyExtra / 2)) : 0;
      let childViewLength = this.get('childComponentsX').length;
      let loopCounterCache = Math.min(firstInView + childViewLength, itemCount);
      this.get('_AFQ_VIRTUAL_LIST').clear();
      this._args = [this, itemHeight, this.get('itemContentProperty'), this.get('items'), firstInView, childViewLength, loopCounterCache];
      this.get('_AFQ_VIRTUAL_LIST').add(this._raf);
    }


  },
  _onNativeRender( scrollLeft, scrollTop ) {

    if ( !this.get('isDestroyed') && isFinite(scrollTop) ) {

      let itemHeight = this.get('itemHeight');
      let itemCount = this.get('items') ? this.get('items').length : 0;
      let height = this.get('height');
      let howManyInWindow = Math.ceil(height / itemHeight);
      let howManyExtra = Math.min(itemCount - howManyInWindow, 100);
      let firstInView = ((Math.floor(scrollTop / itemHeight)) > 0) ? (Math.floor(scrollTop / itemHeight) - Math.ceil(howManyExtra / 2)) : 0;
      let childViewLength = this.get('childComponentsX').length;
      let loopCounterCache = Math.min(firstInView + childViewLength, itemCount);
      this._args = [this, itemHeight, this.get('itemContentProperty'), this.get('items'), firstInView, childViewLength, loopCounterCache];
      this.get('_AFQ_VIRTUAL_LIST').clear();
      this.get('_AFQ_VIRTUAL_LIST').add(this._raf);
      //window.requestAnimationFrame(this._raf);

    }


  },
  items: null,
  itemHeight: null,
  itemComponent: null,
  updateTrigger:false,
  renderedComponentsDidChange: on('init', observer('items', 'items.[]', 'height', 'width', 'updateTrigger', function () {

    once(this, 'processRenderedComponentsChange');
  })),

  willDestroyElement() {
    this._super(...arguments);
  },

  processRenderedComponentsChange() {

    let height = this.get('height');
    let itemCount = this.get('items') ? this.get('items').length : 0;
    let itemHeight = this.get('itemHeight');
    let requiredItemCount = 0;
    let element = this.get('element');
    let howManyInWindow = Math.ceil(height / itemHeight);
    let howManyExtra = Math.min(itemCount - howManyInWindow, 100);
    if ( itemCount < 100 ) {
      requiredItemCount = itemCount;
    }
    else {
      requiredItemCount = Math.min(itemCount, Math.ceil(height / itemHeight) + howManyExtra);
    }
    let childViewCount = this.get('renderedComponents').length;

    if ( requiredItemCount < childViewCount ) {
      this.set('renderedComponents', A(take(this.get('renderedComponents'), requiredItemCount)));
    }
    else {
      let objects = new Array(requiredItemCount - childViewCount).fill(this.get('itemComponent'), childViewCount, childViewCount + requiredItemCount - 1);
      this.get('renderedComponents').pushObjects(objects);
    }

    if ( this.get('useNativeScroll') === false ) {
      element.getElementsByClassName('scroll-panel-content')[ 0 ].style.top = 0;
      element.getElementsByClassName('scroll-panel-content')[ 0 ].style.height = Math.max(itemCount * this.get('itemHeight'), this.get('height')) + 'px';
      this.get('scroller').setDimensions(null, height, null, Math.max(itemCount * this.get('itemHeight')));
      this._onRender(this.get('scroller').getValues().left, this.get('scroller').getValues().top)
    }
    else {
      element.getElementsByClassName('scroll-panel-content')[ 0 ].style[ "transform" ] = 'translate3d(0px, 0px, 0)';
      element.getElementsByClassName('scroll-panel-content')[ 0 ].style.height = Math.max(itemCount * this.get('itemHeight'), this.get('height')) + 'px';
      this._onNativeRender(this.get('scroller').getValues().left, this.get('scroller').getValues().top)
    }

  }
});
