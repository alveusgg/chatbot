'use strict';

const ptzCommand = require('../utils/ptzCommand.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    return ptzCommand(controller, {
        name: 'ptzmove',
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

            camera.moveCamera(args[1]);
            camera.enableAutoFocus();

            if (channel === 'ptzapi') {
                controller.connections.twitch.send(
                    channel,
                    `${user}: ptzmove ${ptzCameraName} ${args[1]}`,
                    true,
                );
            }
        },
    });
};
