'use strict'

const getCameraFromScreenPosition = require('../utils/getCameraFromScreenPosition.js');
const ptzCommandSetup = require('../utils/ptzCommandSetup.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs, cameras, database, twitch } }) => {
  return {
    name: 'ptzgetcam',
    enabled: !!obs && !!cameras && !!database,
    permission: {
      group: 'vip'
    },
    run: async ({ channel, args: _args }) => {
      const { args } = ptzCommandSetup(obs, cameras, database, _args);

      const x = Number(args[1])
      const y = Number(args[2])

      if (isNaN(x) || isNaN(y)) {
        return;
      }

      const camera = getCameraFromScreenPosition(database, x, y)

      let output
      if (args[3] === 'json') {
        output = JSON.stringify({
          cam: camera.ptzCameraName,
          position: camera.zone + 1
        });
      } else {
        output = camera.ptzCameraName
      }

      twitch.send(channel, output);
    }
  }
};
