'use strict'

const ptzCommandSetup = require('../utils/ptzCommandSetup.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { api, obs, cameras, database, twitch } }) => {
  return {
    name: 'ptzlist',
    enabled: !!api && !!obs && !!cameras && !!database,
    permission: {
      group: 'vip'
    },
    run: async ({ channel, args: _args }) => {
      const { specificCamera, currentScene } = ptzCommandSetup(obs, cameras, database, _args);

      if (channel === 'ptzapi') {
        await api.sendAPI(`PTZ Presets: ${Object.keys(database[specificCamera ?? currentScene].presets).sort().toString()}`)
      } else {
        await twitch.send(channel, `PTZ Presets: ${Object.keys(database[specificCamera ?? currentScene].presets).sort().toString()}`)
      }
    }
  }
};
