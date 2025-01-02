'use strict'

const getCurrentScene = require('../utils/getCurrentScene.js');
const ptzCommandSetup = require('../utils/ptzCommandSetup.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { api, obs, obsBot, cameras, database } }) => {
  return {
    name: 'ptzspin',
    enabled: !!api && !!obs && !!obsBot && !!cameras && !!database,
    permission: {
      group: 'operator'
    },
    run: async ({ args: _args }) => {
      const currentScene = getCurrentScene();

      if (currentScene === 'nuthouse') {
        obsBot.stop();
      } else {
        const { camera } = ptzCommandSetup(obs, cameras, database, _args);

        await camera.continuousPanTilt(0, 0, 0);
      }
    }
  }
};
