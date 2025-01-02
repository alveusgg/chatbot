'use strict'

const ptzCommandSetup = require('../utils/ptzCommandSetup.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { api, obs, cameras, database } }) => {
  return {
    name: 'ptzspin',
    enabled: !!api && !!obs && !!cameras && !!database,
    permission: {
      group: 'operator'
    },
    run: async ({ args }) => {
      const { camera } = ptzCommandSetup(obs, cameras, database, args);
      
      const pan = Number(args[1]);
      const tilt = Number(args[2]);
      const zoom = Number(args[3]);

      if (isNaN(pan) || isNaN(tilt) || isNaN(zoom)) {
        return;
      }

      await camera.continuousPanTilt(pan, tilt, zoom);
    }
  }
};
