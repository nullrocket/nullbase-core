import Ember from 'ember';


export default Ember.Component.extend({
  contextMenu: true,
  tagName: '',
  didInsertElement(){
    if ( !this.get('contextMenu') ) {
      document.addEventListener('contextmenu', function ( e ) {
        if ( !(e.target.matches('input') || e.target.matches('textarea')) ) {
          e.preventDefault();
        }
      });
    }
    document.addEventListener("DOMContentLoaded", function(event) {

      // Add selectText function to jQuery
      // figure out how to make this a native thing
      /*
      $(function () {

        $.fn.selectText = function () {
          var doc = document, element = this[ 0 ], range, selection;

          if ( doc.body.createTextRange ) {

            range = document.body.createTextRange();
            range.moveToElementText(element);
            range.select();
          }
          else if ( window.getSelection ) {

            selection = window.getSelection();
            range = document.createRange();
            range.selectNodeContents(element);
            selection.removeAllRanges();
            selection.addRange(range);

          }
        };
      });
*/

    });


  }
});
