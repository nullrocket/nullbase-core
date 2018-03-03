import Helper from '@ember/component/helper';


export default Helper.extend({
  compute(params,hash) {

    let icon = params[0];
    let color = params[1];
    return icon +"-"+ color;
  }
});
