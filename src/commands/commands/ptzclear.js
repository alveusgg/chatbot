'use strict'

const ptzCommandSetup = require('../utils/ptzCommandSetup.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { api, obs, cameras, database } }) => {
  return {
    name: 'ptzclear',
    enabled: !!api && !!obs && !!cameras && !!database,
    permission: {
      group: 'superUser'
    },
    run: async ({ args: _args }) => {
      const { specificCamera, currentScene } = ptzCommandSetup(obs, cameras, database, _args);

      database[specificCamera ?? currentScene].presets = {};
    }
  }
};
