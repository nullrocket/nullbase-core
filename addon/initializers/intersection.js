


let observer = new IntersectionObserver(entries => {
  entries.forEach((entry)=>{

    let event = new CustomEvent('inview',{detail:{intersectionRatio:entry.intersectionRatio}});
    entry.target.dispatchEvent(event);
  });


});



export function initialize( application ) {
  application.register('service:intersection', observer, { instantiate: false });
}


export default {
  name: 'intersection',
  initialize
};