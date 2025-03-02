'use strict'

const ptzCommandSetup = require('../utils/ptzCommandSetup.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs, cameras, database, twitch } }) => {
  return {
    name: 'ptztilt',
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

      const arg1 = Number(args[1]);
      if (isNaN(arg1)) {
        return;
      }

      camera.tiltCamera(arg1);
      camera.enableAutoFocus();

      if (channel === 'ptzapi') {
        twitch.send(channel, `${user}: ptztilt ${ptzCameraName} ${args[1]}`, true);
      }
    }
  }
};
