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
      const arg1 = Number(arg1Lower);

      if (arg1Lower === 'off' || arg1 === 0) {
        camera.continuousFocus(0);
        return;
      }
      

      if (arg1 >= -100 && arg1 <= 100) {
        camera.continuousFocus(arg1);
      }
    }
  }
};
