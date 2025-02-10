'use strict'

/**
 * @param {string} arg
 * @returns {number | undefined} 
 */
module.exports = (arg) => {
  arg = arg.trim().toLowerCase()

  const number = Number(arg)

  return isNaN(number) ? undefined : number
}
