
import ResizeObserver from '../util/resize-observer';

const observer = new ResizeObserver(( entries /*, observer*/ ) => {
  entries.forEach((entry)=>{

    let event = new CustomEvent('resize');
    entry.target.dispatchEvent(event);
  });

});


export function initialize( application ) {
  application.register('service:resize', observer, { instantiate: false });
}


export default {
  name: 'resize',
  initialize
};