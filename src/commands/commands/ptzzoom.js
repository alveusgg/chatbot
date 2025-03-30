'use strict'

const getCurrentScene = require('../utils/getCurrentScene.js');
const ptzCommandSetup = require('../utils/ptzCommandSetup.js');
const toNumber = require('../utils/toNumber.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs, obsBot, cameras, database } }) => {
  return {
    name: 'ptzzoom',
    enabled: !!obs && !!obsBot && !!cameras && !!database,
    permission: {
      group: 'operator'
    },
    run: async ({ args: _args }) => {
      const currentScene = getCurrentScene(obs);

      if (currentScene === 'nuthouse') {
        obsBot.setZoom(_args[1].trim().toLowerCase())
      } else {
        const {
          camera,
          args
        } = ptzCommandSetup(obs, cameras, database, _args);
        
        if (!camera) {
          // Couldn't find the camera
          return;
        }

        const arg1 = toNumber(args[1]);
        if (arg1 === undefined) {
          return;
        }

        const zscaledAmount = arg1 * 100 | 0;

        camera.zoomCamera(zscaledAmount);
        camera.enableAutoFocus();
      }
    }
  }
};
