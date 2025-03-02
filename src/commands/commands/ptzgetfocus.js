'use strict'

const ptzCommandSetup = require('../utils/ptzCommandSetup.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { api, obs, cameras, database, twitch } }) => {
  return {
    name: 'ptzgetfocus',
    enabled: !!api && !!obs && !!cameras && !!database,
    permission: {
      group: 'operator'
    },
    run: async ({ channel, args: _args }) => {
      const { camera } = ptzCommandSetup(obs, cameras, database, _args);

      const position = await camera.getPosition();
      if (!position) {
        return;
      }

      const focus = parseFloat(position.focus);
      if (!isNaN(focus)) {
        await twitch.send(channel, `PTZ focus (1-9999): ${focus}`);
      }
    }
  }
};
