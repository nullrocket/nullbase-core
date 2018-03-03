import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from './template';
import ThemedComponent from 'nullbase-core/mixins/nb-themed-component';
import max from "lodash/max";
import map from 'lodash/map';
import merge from 'lodash/merge';
import find from 'lodash/find';
import extend from 'lodash/extend';
import createFocusTrap from "nullbase-core/utils/focus-trap";
function topZIndex() {

  return max(map(document.querySelectorAll('*'), function ( el ) {
    return parseInt(
      getComputedStyle(el, null).getPropertyValue('z-index')
    );

  }));
}
export default Component.extend(ThemedComponent, {
  layout,
  menuIcon: "menu-down-grey",
  gestures: service(),
  classNames: [ 'nb-color-select' ],
  parentFocusTrap: null,
  icon: "",
  useNativeScroll:false,
  optionComponent:'nb-color-select-option',
  init(){
    this._super(...arguments);

  },
  error: false,
  options: [
    

{value:"red-50",  display:"#FFEBEE"},
{value:"red-100",  display:"#FFCDD2"},
{value:"red-200",  display:"#EF9A9A"},
{value:"red-300",  display:"#E57373"},
{value:"red-400",  display:"#EF5350"},
{value:"red-500",  display:"#F44336"},
{value:"red-600",  display:"#E53935"},
{value:"red-700",  display:"#D32F2F"},
{value:"red-800",  display:"#C62828"},
{value:"red-900",  display:"#B71C1C"},
{value:"red-a100",  display:"#FF8A80"},
{value:"red-a200",  display:"#FF5252"},
{value:"red-a400",  display:"#FF1744"},
{value:"red-a700",  display:"#D50000"},


{value:"pink-50",  display:"#FCE4EC"},
{value:"pink-100",  display:"#F8BBD0"},
{value:"pink-200",  display:"#F48FB1"},
{value:"pink-300",  display:"#F06292"},
{value:"pink-400",  display:"#EC407A"},
{value:"pink-500",  display:"#E91E63"},
{value:"pink-600",  display:"#D81B60"},
{value:"pink-700",  display:"#C2185B"},
{value:"pink-800",  display:"#AD1457"},
{value:"pink-900",  display:"#880E4F"},
{value:"pink-a100",  display:"#FF80AB"},
{value:"pink-a200",  display:"#FF4081"},
{value:"pink-a400",  display:"#F50057"},
{value:"pink-a700",  display:"#C51162"},


{value:"purple-50",  display:"#F3E5F5"},
{value:"purple-100",  display:"#E1BEE7"},
{value:"purple-200",  display:"#CE93D8"},
{value:"purple-300",  display:"#BA68C8"},
{value:"purple-400",  display:"#AB47BC"},
{value:"purple-500",  display:"#9C27B0"},
{value:"purple-600",  display:"#8E24AA"},
{value:"purple-700",  display:"#7B1FA2"},
{value:"purple-800",  display:"#6A1B9A"},
{value:"purple-900",  display:"#4A148C"},
{value:"purple-a100",  display:"#EA80FC"},
{value:"purple-a200",  display:"#E040FB"},
{value:"purple-a400",  display:"#D500F9"},
{value:"purple-a700",  display:"#AA00FF"},


{value:"deep-purple-50",  display:"#EDE7F6"},
{value:"deep-purple-100",  display:"#D1C4E9"},
{value:"deep-purple-200",  display:"#B39DDB"},
{value:"deep-purple-300",  display:"#9575CD"},
{value:"deep-purple-400",  display:"#7E57C2"},
{value:"deep-purple-500",  display:"#673AB7"},
{value:"deep-purple-600",  display:"#5E35B1"},
{value:"deep-purple-700",  display:"#512DA8"},
{value:"deep-purple-800",  display:"#4527A0"},
{value:"deep-purple-900",  display:"#311B92"},
{value:"deep-purple-a100",  display:"#B388FF"},
{value:"deep-purple-a200",  display:"#7C4DFF"},
{value:"deep-purple-a400",  display:"#651FFF"},
{value:"deep-purple-a700",  display:"#6200EA"},



{value:"indigo-50",  display:"#E8EAF6"},
{value:"indigo-100",  display:"#C5CAE9"},
{value:"indigo-200",  display:"#9FA8DA"},
{value:"indigo-300",  display:"#7986CB"},
{value:"indigo-400",  display:"#5C6BC0"},
{value:"indigo-500",  display:"#3F51B5"},
{value:"indigo-600",  display:"#3949AB"},
{value:"indigo-700",  display:"#303F9F"},
{value:"indigo-800",  display:"#283593"},
{value:"indigo-900",  display:"#1A237E"},
{value:"indigo-a100",  display:"#8C9EFF"},
{value:"indigo-a200",  display:"#536DFE"},
{value:"indigo-a400",  display:"#3D5AFE"},
{value:"indigo-a700",  display:"#304FFE"},



{value:"blue-50",  display:"#E3F2FD"},
{value:"blue-100",  display:"#BBDEFB"},
{value:"blue-200",  display:"#90CAF9"},
{value:"blue-300",  display:"#64B5F6"},
{value:"blue-400",  display:"#42A5F5"},
{value:"blue-500",  display:"#2196F3"},
{value:"blue-600",  display:"#1E88E5"},
{value:"blue-700",  display:"#1976D2"},
{value:"blue-800",  display:"#1565C0"},
{value:"blue-900",  display:"#0D47A1"},
{value:"blue-a100",  display:"#82B1FF"},
{value:"blue-a200",  display:"#448AFF"},
{value:"blue-a400",  display:"#2979FF"},
{value:"blue-a700",  display:"#2962FF"},


{value:"light-blue-50",  display:"#E1F5FE"},
{value:"light-blue-100",  display:"#B3E5FC"},
{value:"light-blue-200",  display:"#81D4FA"},
{value:"light-blue-300",  display:"#4FC3F7"},
{value:"light-blue-400",  display:"#29B6F6"},
{value:"light-blue-500",  display:"#03A9F4"},
{value:"light-blue-600",  display:"#039BE5"},
{value:"light-blue-700",  display:"#0288D1"},
{value:"light-blue-800",  display:"#0277BD"},
{value:"light-blue-900",  display:"#01579B"},
{value:"light-blue-a100",  display:"#80D8FF"},
{value:"light-blue-a200",  display:"#40C4FF"},
{value:"light-blue-a400",  display:"#00B0FF"},
{value:"light-blue-a700",  display:"#0091EA"},


{value:"cyan-50",  display:"#E0F7FA"},
{value:"cyan-100",  display:"#B2EBF2"},
{value:"cyan-200",  display:"#80DEEA"},
{value:"cyan-300",  display:"#4DD0E1"},
{value:"cyan-400",  display:"#26C6DA"},
{value:"cyan-500",  display:"#00BCD4"},
{value:"cyan-600",  display:"#00ACC1"},
{value:"cyan-700",  display:"#0097A7"},
{value:"cyan-800",  display:"#00838F"},
{value:"cyan-900",  display:"#006064"},
{value:"cyan-a100",  display:"#84FFFF"},
{value:"cyan-a200",  display:"#18FFFF"},
{value:"cyan-a400",  display:"#00E5FF"},
{value:"cyan-a700",  display:"#00B8D4"},



{value:"teal-50",  display:"#E0F2F1"},
{value:"teal-100",  display:"#B2DFDB"},
{value:"teal-200",  display:"#80CBC4"},
{value:"teal-300",  display:"#4DB6AC"},
{value:"teal-400",  display:"#26A69A"},
{value:"teal-500",  display:"#009688"},
{value:"teal-600",  display:"#00897B"},
{value:"teal-700",  display:"#00796B"},
{value:"teal-800",  display:"#00695C"},
{value:"teal-900",  display:"#004D40"},
{value:"teal-a100",  display:"#A7FFEB"},
{value:"teal-a200",  display:"#64FFDA"},
{value:"teal-a400",  display:"#1DE9B6"},
{value:"teal-a700",  display:"#00BFA5"},



{value:"green-50",  display:"#E8F5E9"},
{value:"green-100",  display:"#C8E6C9"},
{value:"green-200",  display:"#A5D6A7"},
{value:"green-300",  display:"#81C784"},
{value:"green-400",  display:"#66BB6A"},
{value:"green-500",  display:"#4CAF50"},
{value:"green-600",  display:"#43A047"},
{value:"green-700",  display:"#388E3C"},
{value:"green-800",  display:"#2E7D32"},
{value:"green-900",  display:"#1B5E20"},
{value:"green-a100",  display:"#B9F6CA"},
{value:"green-a200",  display:"#69F0AE"},
{value:"green-a400",  display:"#00E676"},
{value:"green-a700",  display:"#00C853"},



{value:"light-green-50",  display:"#F1F8E9"},
{value:"light-green-100",  display:"#DCEDC8"},
{value:"light-green-200",  display:"#C5E1A5"},
{value:"light-green-300",  display:"#AED581"},
{value:"light-green-400",  display:"#9CCC65"},
{value:"light-green-500",  display:"#8BC34A"},
{value:"light-green-600",  display:"#7CB342"},
{value:"light-green-700",  display:"#689F38"},
{value:"light-green-800",  display:"#558B2F"},
{value:"light-green-900",  display:"#33691E"},
{value:"light-green-a100",  display:"#CCFF90"},
{value:"light-green-a200",  display:"#B2FF59"},
{value:"light-green-a400",  display:"#76FF03"},
{value:"light-green-a700",  display:"#64DD17"},



{value:"lime-50",  display:"#F9FBE7"},
{value:"lime-100",  display:"#F0F4C3"},
{value:"lime-200",  display:"#E6EE9C"},
{value:"lime-300",  display:"#DCE775"},
{value:"lime-400",  display:"#D4E157"},
{value:"lime-500",  display:"#CDDC39"},
{value:"lime-600",  display:"#C0CA33"},
{value:"lime-700",  display:"#AFB42B"},
{value:"lime-800",  display:"#9E9D24"},
{value:"lime-900",  display:"#827717"},
{value:"lime-a100",  display:"#F4FF81"},
{value:"lime-a200",  display:"#EEFF41"},
{value:"lime-a400",  display:"#C6FF00"},
{value:"lime-a700",  display:"#AEEA00"},



{value:"yellow-50",  display:"#FFFDE7"},
{value:"yellow-100",  display:"#FFF9C4"},
{value:"yellow-200",  display:"#FFF59D"},
{value:"yellow-300",  display:"#FFF176"},
{value:"yellow-400",  display:"#FFEE58"},
{value:"yellow-500",  display:"#FFEB3B"},
{value:"yellow-600",  display:"#FDD835"},
{value:"yellow-700",  display:"#FBC02D"},
{value:"yellow-800",  display:"#F9A825"},
{value:"yellow-900",  display:"#F57F17"},
{value:"yellow-a100",  display:"#FFFF8D"},
{value:"yellow-a200",  display:"#FFFF00"},
{value:"yellow-a400",  display:"#FFEA00"},
{value:"yellow-a700",  display:"#FFD600"},



{value:"amber-50",  display:"#FFF8E1"},
{value:"amber-100",  display:"#FFECB3"},
{value:"amber-200",  display:"#FFE082"},
{value:"amber-300",  display:"#FFD54F"},
{value:"amber-400",  display:"#FFCA28"},
{value:"amber-500",  display:"#FFC107"},
{value:"amber-600",  display:"#FFB300"},
{value:"amber-700",  display:"#FFA000"},
{value:"amber-800",  display:"#FF8F00"},
{value:"amber-900",  display:"#FF6F00"},
{value:"amber-a100",  display:"#FFE57F"},
{value:"amber-a200",  display:"#FFD740"},
{value:"amber-a400",  display:"#FFC400"},
{value:"amber-a700",  display:"#FFAB00"},



{value:"orange-50",  display:"#FFF3E0"},
{value:"orange-100",  display:"#FFE0B2"},
{value:"orange-200",  display:"#FFCC80"},
{value:"orange-300",  display:"#FFB74D"},
{value:"orange-400",  display:"#FFA726"},
{value:"orange-500",  display:"#FF9800"},
{value:"orange-600",  display:"#FB8C00"},
{value:"orange-700",  display:"#F57C00"},
{value:"orange-800",  display:"#EF6C00"},
{value:"orange-900",  display:"#E65100"},
{value:"orange-a100",  display:"#FFD180"},
{value:"orange-a200",  display:"#FFAB40"},
{value:"orange-a400",  display:"#FF9100"},
{value:"orange-a700",  display:"#FF6D00"},



{value:"deep-orange-50",  display:"#FBE9E7"},
{value:"deep-orange-100",  display:"#FFCCBC"},
{value:"deep-orange-200",  display:"#FFAB91"},
{value:"deep-orange-300",  display:"#FF8A65"},
{value:"deep-orange-400",  display:"#FF7043"},
{value:"deep-orange-500",  display:"#FF5722"},
{value:"deep-orange-600",  display:"#F4511E"},
{value:"deep-orange-700",  display:"#E64A19"},
{value:"deep-orange-800",  display:"#D84315"},
{value:"deep-orange-900",  display:"#BF360C"},
{value:"deep-orange-a100",  display:"#FF9E80"},
{value:"deep-orange-a200",  display:"#FF6E40"},
{value:"deep-orange-a400",  display:"#FF3D00"},
{value:"deep-orange-a700",  display:"#DD2C00"},



{value:"brown-50",  display:"#EFEBE9"},
{value:"brown-100",  display:"#D7CCC8"},
{value:"brown-200",  display:"#BCAAA4"},
{value:"brown-300",  display:"#A1887F"},
{value:"brown-400",  display:"#8D6E63"},
{value:"brown-500",  display:"#795548"},
{value:"brown-600",  display:"#6D4C41"},
{value:"brown-700",  display:"#5D4037"},
{value:"brown-800",  display:"#4E342E"},
{value:"brown-900",  display:"#3E2723"},



{value:"grey-50",  display:"#FAFAFA"},
{value:"grey-100",  display:"#F5F5F5"},
{value:"grey-200",  display:"#EEEEEE"},
{value:"grey-300",  display:"#E0E0E0"},
{value:"grey-400",  display:"#BDBDBD"},
{value:"grey-500",  display:"#9E9E9E"},
{value:"grey-600",  display:"#757575"},
{value:"grey-700",  display:"#616161"},
{value:"grey-800",  display:"#424242"},
{value:"grey-900",  display:"#212121"},


{value:"blue-grey-50",  display:"#ECEFF1"},
{value:"blue-grey-100",  display:"#CFD8DC"},
{value:"blue-grey-200",  display:"#B0BEC5"},
{value:"blue-grey-300",  display:"#90A4AE"},
{value:"blue-grey-400",  display:"#78909C"},
{value:"blue-grey-500",  display:"#607D8B"},
{value:"blue-grey-600",  display:"#546E7A"},
{value:"blue-grey-700",  display:"#455A64"},
{value:"blue-grey-800",  display:"#37474F"},
{value:"blue-grey-900",  display:"#263238"},

{value:"black",  display:"#000000"},
{value:"white",  display:"#FFFFFF"}
  ],
  displayOptions: computed('options', 'value', function () {
    var self = this;
    return map(this.get('options'), function ( option ) {
      return merge({}, option, { selected: option.value === self.get('value') })
    })
  }),
  actions: {
    onSelectOption( value ){
      this.sendAction('onSelectOption', value);
      this.send('closeDropDown');

    },
    closeDropDown(){
      this.get('gestures').removeEventListener(document, 'down', this._bodyDown);
      this.get('focusTrap').deactivate();
      this.get('dropDown').hide();

      $('.select-display', this.get('element')).focus();
    },
    showDropDown(){

      this.get('gestures').addEventListener(document, 'down', this._bodyDown);

      this.get('dropDown').show();
      $(window).trigger('resize');
      $(this.get('tetherObject').element).width(this.$('.input-wrapper').width());

      Tether.position();
      this.get('dropDown').focus();
      this.get('focusTrap').activate()


    }
  },
  display: computed('value', function () {
    let selectedOption = find(this.get('options'), { value: this.get('value') });

    if ( selectedOption ) {
      return selectedOption.value;
    }
    else {
      return "";
    }
  }),
  willDestroyElement(){
   
    $(this.get('tetherObject').element).appendTo(this.get('element'));
    $(window).off('resize',this.resize);

    this.get('tetherObject').destroy();
  },
  didInsertElement(){
    let self = this;
    let gestures = this.get('gestures');
    self.$('.nb-color-select-drop-down').width(self.$('.input-wrapper').width());
    self.$('.nb-color-select-drop-down').css('max-height','500px').css('min-height','400px');
    var $dropDown = self.$('.nb-color-select-drop-down');
    this.set('dropDown', $dropDown);
    var options = {
      element: self.$('.nb-color-select-drop-down'),
      target: self.$('.input-wrapper'),
      attachment: 'top left',
      targetAttachment: 'top left',
      //    offset: side ==="right" ? "0 "+width+"px" :"0 0",
      optimizations: {

        gpu: true
      },
      constraints: [
        {
          to: [10,10,$('body').width() -10,$('body').height()-10],   //''scrollParent',
          attachment: 'both',
          pin:true
        }
      ]
    };
    var tetherObject = new Tether(options);

    this.set('tetherObject', tetherObject);

    var focusTrap = createFocusTrap(this.get('tetherObject').element, {
      initialFocus: this.get('tetherObject').element,
      onActivate: function () {
        if ( self.get('parentFocusTrap') ) {
          self.get('parentFocusTrap').pause();
        }
      },
      onDeactivate: function () {
        if ( self.get('parentFocusTrap') ) {
          self.get('parentFocusTrap').unpause();
        }
      }
    });

    this.set('focusTrap', focusTrap);

    $dropDown.css({ 'zIndex': topZIndex() })
    this._tap = function ( event ) {
      event.preventDefault();
      event.stopPropagation();
      self.send('showDropDown');
    };

    this._bodyDown = function ( event ) {
      self.send('closeDropDown');

    };

    this.$().on('keydown', function ( evt ) {
      var key = evt.which || evt.keyCode;


      if ( key === 32 ) {
        event.preventDefault();
        event.stopPropagation();

        self.send('showDropDown');
      }


      // down arrow
      if ( key === 40 ) {
        event.preventDefault();
        event.stopPropagation();
        self.send('showDropDown');
      }

    });
  this.resize = function(){

    self.get('tetherObject').setOptions(extend(options,{constraints: [
      {
        to: [10,10,$('body').width() -10,$('body').height()-10],   //''scrollParent',
        attachment: 'both',
        pin:true
      }
    ]}));
  };
  $(window).on('resize',this.resize);
    gestures.addEventListener(this.get('element'), 'tap', this._tap);

  }
});
