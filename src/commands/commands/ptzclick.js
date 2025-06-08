'use strict';

const findBox = require('../utils/findBox.js');
const ptzCommand = require('../utils/ptzCommand.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    const { connections: { obs, cameras, database, twitch } } = controller;

    return ptzCommand(controller, {
        name: 'ptzclick',
        enabled: !!obs && !!cameras && !!database,
        permission: {
            group: 'operator',
        },
        throttling: 'ptz',
        run: async ({ channel, user, args }) => {
            const xCoord = parseInt(args[1], 10);
            const yCoord = parseInt(args[2], 10);
            const zoom = parseInt(args[3], 10);

            if (isNaN(xCoord) || isNaN(yCoord) || isNaN(zoom)) {
                return;
            }

            const clickbox = findBox(database, xCoord, yCoord);
            const camera = cameras[clickbox.ptzCameraName];

            await camera.ptz({
                areazoom: `${Math.round(clickbox.x)},${Math.round(
                    clickbox.y,
                )},${Math.round(zoom)}`,
            });

            if (args[4] !== 'off') {
                await camera.enableAutoFocus();
            }

            if (channel === 'ptzapi') {
                twitch.send(
                    channel,
                    `${user} clicked on ${clickbox.zone + 1}: ${
                        clickbox.ptzCameraName
                    }`,
                );
            } else {
                twitch.send(
                    channel,
                    `Clicked on ${clickbox.zone + 1}: ${
                        clickbox.ptzCameraName
                    }`,
                );
            }
        },
    });
};
