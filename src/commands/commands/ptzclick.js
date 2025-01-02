'use strict'

const findBox = require('../utils/findBox.js');
const ptzCommandSetup = require('../utils/ptzCommandSetup.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs, cameras, database, twitch } }) => {
  return {
    name: 'ptzclick',
    enabled: !!obs && !!cameras && !!database,
    permission: {
      group: 'operator'
    },
    run: async ({ channel, user, args: _args }) => {
      const { args } = ptzCommandSetup(obs, cameras, database, _args);

      const xCoord = parseInt(args[1], 10);
      const yCoord = parseInt(args[2], 10);
      const zoom = parseInt(args[3], 10);

      if (isNaN(xCoord) || isNaN(yCoord) || isNaN(zoom)) {
        return;
      }

      const clickbox = findBox(database, xCoord, yCoord);
      const camera = cameras[clickbox.ptzCameraName];
      
      await camera.ptz({ areazoom: `${Math.round(clickbox.x)},${Math.round(clickbox.y)},${Math.round(zoom)}` });

      if (args[4] !== 'off') {
        await camera.enableAutoFocus();
      }

      if (channel === 'ptzapi') {
        twitch.send(channel, `${user} clicked on ${clickbox.zone + 1}: ${clickbox.ptzCameraName}`);
      } else {
        twitch.send(channel, `Clicked on ${clickbox.zone + 1}: ${clickbox.ptzCameraName}`);
      }
    }
  }
};
