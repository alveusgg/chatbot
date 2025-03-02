'use strict'

const ptzCommandSetup = require('../utils/ptzCommandSetup.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs, cameras, database } }) => {
  return {
    name: 'ptzcfocus',
    enabled: !!obs && !!cameras && !!database,
    permission: {
      group: 'operator'
    },
    run: async ({ args: _args }) => {
      const {
        camera,
        args
      } = ptzCommandSetup(obs, cameras, database, _args);
      
      if (!camera) {
        // Couldn't find the camera
        return;
      }

      const arg1Lower = args[1].toLowerCase();
      if (arg1Lower === 'off') {
        camera.continuousFocus(0);
        return;
      }

      const arg1 = Number(arg1Lower);

      if (!isNaN(arg1)) {
        camera.continuousFocus(arg1);
      }
    }
  }
};
