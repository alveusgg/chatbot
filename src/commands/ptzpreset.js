'use strict'

const ptzCommandSetup = require('./utils/ptzCommandSetup.js');

/**
 * @type {import('./types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs, cameras, database } }) => {
  return {
    name: 'ptzpreset',
    enabled: !!obs && !!cameras && !!database,
    permission: {
      group: 'operator'
    },
    run: async ({ args: _args }) => {
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
      if (specificCamera !== '' && arg1Lower !== '') {
        camera.goToPreset(arg1Lower);
      } else {
        camera.goToPreset(specificCamera);
      }

      camera.enableAutoFocus();
    }
  }
};
