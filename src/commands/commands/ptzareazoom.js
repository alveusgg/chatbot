'use strict';

const ptzCommand = require('../utils/ptzCommand.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    const { connections: { twitch } } = controller;

    return ptzCommand(controller, {
        name: 'ptzareazoom',
        enabled: true,
        permission: {
            group: 'operator'
        },
        throttling: 'ptz',
        run: async ({ channel, user, args, ptzCameraName, camera }) => {
            if (!camera) {
                // Couldn't find the camera
                return;
            }

            const arg1 = args[1].trim().toLowerCase();
            const arg2 = args[2].trim().toLowerCase();
            const arg3 = args[3].trim().toLowerCase();

            camera.ptz({ areazoom: `${arg1},${arg2},${arg3}` });
            camera.enableAutoFocus();

            if (channel === 'ptzapi') {
                twitch.send(
                    channel,
                    `${user}: Clicked on ${ptzCameraName}`,
                    true,
                );
            }
        }
    });
};
