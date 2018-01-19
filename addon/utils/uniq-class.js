
let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export default function makeid() {

  return  [...Array(12)].map(() => possible.charAt(Math.floor(Math.random() * possible.length))).join('');

}