'use strict'

const getCameraFromScreenPosition = require('../utils/getCameraFromScreenPosition.js');
const ptzCommandSetup = require('../utils/ptzCommandSetup.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs, cameras, database, twitch } }) => {
  return {
    name: 'ptzdraw',
    enabled: !!obs && !!cameras && !!database,
    permission: {
      group: 'operator'
    },
    run: async ({ channel, args: _args }) => {
      const { args } = ptzCommandSetup(obs, cameras, database, _args);

      const x = Number(args[1])
      const y = Number(args[2])
      const zoom = Number(args[3])

      if (isNaN(x) || isNaN(y) || isNaN(zoom)) {
        return;
      }

      const cameraBox = getCameraFromScreenPosition(database, x, y)

      // TODO can camerabox be undefined

      const camera = cameras[cameraBox.ptzCameraName];
      
      await camera.ptz({ areazoom: `${Math.round(cameraBox.x)},${Math.round(cameraBox.y)},${Math.round(zoom)}` });

      if (args[4] !== 'off') {
        await camera.enableAutoFocus();
      }

      if (channel === 'ptzapi') {
        controller.connections.twitch.send(channel, `${user} clicked on ${cameraBox.zone + 1}: ${cameraBox.ptzcamName}`, true);
      } else {
        twitch,send(channel, `Clicked on ${cameraBox.zone + 1}: ${cameraBox.ptzcamName}}`)
      }
    }
  }
};
