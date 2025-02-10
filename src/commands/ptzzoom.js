'use strict'

const ptzCommandSetup = require('./utils/ptzCommandSetup.js');
const toNumber = require('./utils/toNumber.js');

/**
 * @type {import('./types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs, cameras, database } }) => {
  return {
    name: 'ptzzoom',
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

      const arg1 = toNumber(args[1]);
      if (arg1 === undefined) {
        return;
      }

      const zscaledAmount = arg1 * 100 | 0;

      camera.zoomCamera(zscaledAmount);
      camera.enableAutoFocus();
    }
  }
};
