'use strict';

const findBox = require('../utils/findBox.js');
const ptzCommandSetup = require('../utils/ptzCommandSetup.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs, cameras, database, twitch } }) => {
    return {
        name: 'ptzdraw',
        enabled: !!obs && !!cameras && !!database,
        permission: {
            group: 'operator',
        },
        throttling: 'ptz',
        run: async ({ channel, user, args: _args }) => {
            const { args } = ptzCommandSetup(obs, cameras, database, _args);

            const sourceX = parseInt(args[1], 10);
            const sourceY = parseInt(args[2], 10);
            const sourceWidth = parseInt(args[3], 10);
            const sourceHeight = parseInt(args[4], 10);

            // Calculate the x and y coordinates for the center of the rectangle
            const xDrawcord = sourceX + sourceWidth / 2;
            const yDrawcord = sourceY + sourceHeight / 2;

            // Call findBox to determin which bx the rectangle is in and assign the relevant cameras
            const drawbox = findBox(database, xDrawcord, yDrawcord);

            // Scale the rectangle to 1920x1080
            const scaledWidth = sourceWidth / drawbox.scaleX;
            const scaledHeight = sourceHeight / drawbox.scaleY;

            const zoomWidth = drawbox.sourceWidth / scaledWidth;
            const zoomHeight = drawbox.sourceHeight / scaledHeight;

            const zoom = Math.floor(Math.min(zoomWidth, zoomHeight) * 100);

            // Set the camera
            const camera = cameras[drawbox.ptzCameraName];
            await camera.ptz({
                areazoom: `${Math.round(drawbox.x)},${Math.round(
                    drawbox.y,
                )},${Math.round(zoom)}`,
            });

            if (args[5] !== 'off') {
                await camera.enableAutoFocus();
            }

            if (channel === 'ptzapi') {
                twitch.send(
                    channel,
                    `${user} clicked on ${drawbox.zone + 1}: ${
                        drawbox.ptzCameraName
                    }`,
                    true,
                );
            } else {
                twitch.send(
                    channel,
                    `Clicked on ${drawbox.zone + 1}: ${drawbox.ptzCameraName}`,
                );
            }
        },
    };
};
