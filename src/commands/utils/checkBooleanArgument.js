'use strict'

/**
 * @param {string} value 
 * @returns {boolean | undefined}
 */
module.exports = (value) => {
  switch (value) {
    case '1':
    case 'on':
    case 'yes':
      return true;
    case '0':
    case 'off':
    case 'no':
      return false;
    default:
      return undefined;
  }
}
