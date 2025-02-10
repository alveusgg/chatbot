'use strict'

const ptzCommandSetup = require('./utils/ptzCommandSetup.js');

/**
 * @type {import('./types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs, cameras, database, twitch } }) => {
  return {
    name: 'ptzgetspeed',
    enabled: !!obs && !!cameras && !!database,
    permission: {
      group: 'operator'
    },
    run: async ({ channel, args: _args }) => {
      const { camera } = ptzCommandSetup(obs, cameras, database, _args);
      
      if (!camera) {
        // Couldn't find the camera
        return;
      }

      const camSpeed = await camera.getSpeed();
      twitch.send(channel, `PTZ Speed: ${camSpeed}`);
    }
  }
};
