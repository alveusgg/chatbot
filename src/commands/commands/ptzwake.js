'use strict'

const getCurrentScene = require('../utils/getCurrentScene.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obsBot } }) => {
  return {
    name: 'ptzhome',
    enabled: !!obsBot,
    permission: {
      group: 'operator'
    },
    run: async () => {
      if (getCurrentScene() !== 'nuthouse') {
        return;
      }

      obsBot.wake();
    }
  }
};
