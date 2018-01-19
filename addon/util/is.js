import isString from "lodash/isString";

if ( !Element.prototype.matches )
  Element.prototype.matches =
    Element.prototype.msMatchesSelector ||
    Element.prototype.webkitMatchesSelector;

export default function is( element, selector ) {

  return isString(selector) ? element.matches(selector) : (element === selector);
}