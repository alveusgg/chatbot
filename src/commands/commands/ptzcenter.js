'use strict'

const ptzCommandSetup = require('../utils/ptzCommandSetup.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs, cameras, database, twitch } }) => {
  return {
    name: 'ptzcenter',
    enabled: !!obs && !!cameras && !!database,
    permission: {
      group: 'operator'
    },
    run: async ({ channel, user, args: _args }) => {
      const {
        ptzCameraName,
        camera,
        args
      } = ptzCommandSetup(obs, cameras, database, _args);
      
      if (!camera) {
        // Couldn't find the camera
        return;
      }

      camera.ptz({ center: `${args[1]},${args[2]}`, rzoom: args[3] })
      camera.enableAutoFocus();

      if (channel === 'ptzapi') {
        twitch.send(channel, `${user}: Clicked on ${ptzCameraName}`, true)
      }
    }
  }
};
