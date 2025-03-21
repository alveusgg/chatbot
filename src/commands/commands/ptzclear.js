'use strict'

const ptzCommandSetup = require('../utils/ptzCommandSetup.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { api, obs, cameras, database, twitch } }) => {
  return {
    name: 'ptzclear',
    enabled: !!api && !!obs && !!cameras && !!database,
    permission: {
      group: 'operator'
    },
    run: async ({ args: _args }) => {
      const { specificCamera, currentScene } = ptzCommandSetup(obs, cameras, database, _args);

      database[specificCamera ?? currentScene].presets = {};
    }
  }
};
