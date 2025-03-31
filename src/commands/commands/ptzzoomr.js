'use strict'

const ptzCommandSetup = require('../utils/ptzCommandSetup.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs, cameras, database } }) => {
  return {
    name: 'ptzzoomr',
    enabled: !!obs && !!cameras && !!database,
    permission: {
      group: 'vip'
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

      const arg1 = Number(args[1]);
      if (isNaN(arg1)) {
        return;
      }

      camera.ptz({ areazoom: `960,540,${arg1}` });
      camera.enableAutoFocus();
    }
  }
};
