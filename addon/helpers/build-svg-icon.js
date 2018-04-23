import Helper from '@ember/component/helper';
import {A} from '@ember/array';

export default Helper.extend({
  compute(params,hash) {

    let icon = params[0];
    let color = params[1];

    return A([icon ,color]);
  }
});
