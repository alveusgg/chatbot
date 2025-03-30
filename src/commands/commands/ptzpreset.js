'use strict'

const getCurrentScene = require('../utils/getCurrentScene.js');
const ptzCommandSetup = require('../utils/ptzCommandSetup.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs, obsBot, cameras, database } }) => {
  return {
    name: 'ptzpreset',
    enabled: !!obs && !!obsBot && !!cameras && !!database,
    permission: {
      group: 'operator'
    },
    run: async ({ args: _args }) => {
      const currentScene = getCurrentScene();

      if (currentScene === 'nuthouse') {
        let num;
        switch (_args[0]?.trim()?.toLowerCase() || '') {
          case 'table':
          case 'bench':
            num = 2;
            break;
          case 'room':
            num = 3;
            break;
          case 'counter':
          default:
            num = 1;
            break;
        }

        obsBot.setPreset(num);
      } else {
        const {
          specificCamera,
          camera,
          args
        } = ptzCommandSetup(obs, cameras, database, _args);
        
        if (!camera) {
          // Couldn't find the camera
          return;
        }

        const arg1Lower = args[1].toLowerCase();
        if (specificCamera && arg1Lower !== '') {
          camera.goToPreset(arg1Lower);
        } else {
          camera.goToPreset(specificCamera);
        }

        camera.enableAutoFocus();
      }
    }
  }
};
