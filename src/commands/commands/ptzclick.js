'use strict'

const getCameraFromScreenPosition = require('../utils/getCameraFromScreenPosition.js');
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
    run: async ({ channel, args: _args }) => {
      const { args } = ptzCommandSetup(obs, cameras, database, _args);

      const sourceX = Number(args[1])
      const sourceY = Number(args[2])
      const sourceWidth = Number(args[3])
      const sourceHeight = Number(args[4])

      if (isNaN(sourceX) || isNaN(sourceY) || isNaN(sourceWidth) || isNaN(sourceHeight)) {
        return;
      }

      // Calculate the x & y coordinates for the center of the rectangle
      const drawCordX = sourceX + (sourceWidth / 2);
      const drawCordY = sourceY + (sourceHeight / 2);

      const drawBox = getCameraFromScreenPosition(database, drawCordX, drawCordY)

      // Scale the camera to 1920x1080
      const scaledWidth = sourceWidth / drawBox.scaleX;
      const scaledHeight = sourceHeight / drawBox.scaleY;

      // Calculate the zoom
      const zoomWidth = drawBox.sourceWidth / scaledWidth;
      const zoomHeight = drawBox.sourceHeight / scaledHeight;
      const zoom = Math.floor(Math.min(zoomWidth, zoomHeight) * 100);

      const camera = cameras[drawBox.ptzCameraName];

			await camera.ptz({ areazoom: `${Math.round(drawBox.x)},${Math.round(drawBox.y)},${Math.round(zoom)}` });

      if (args[5] !== 'off') {
        await camera.enableAutoFocus();
      }

      if (channel === 'ptzapi') {
				twitch.send(channel, `${user} clicked on ${drawBox.zone + 1}: ${drawBox.ptzcamName}`, true);
			} else {
			  twitch.send(channel, `Clicked on ${drawBox.zone + 1}: ${drawBox.ptzcamName}`);
			}
    }
  }
};
