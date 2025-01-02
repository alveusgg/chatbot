'use strict';

const ptzCommand = require('../utils/ptzCommand.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    const { connections: { twitch } } = controller;
    return ptzCommand(controller, {
        name: 'ptzcenter',
        enabled: true,
        permission: {
            group: 'operator',
        },
        throttling: 'ptz',
        run: async ({ channel, user, args, camera, ptzCameraName }) => {
            if (!camera) {
                // Couldn't find the camera
                return;
            }

            camera.ptz({ center: `${args[1]},${args[2]}`, rzoom: args[3] });
            camera.enableAutoFocus();

            if (channel === 'ptzapi') {
                twitch.send(
                    channel,
                    `${user}: Clicked on ${ptzCameraName}`,
                    true,
                );
            }
        },
    });
};
