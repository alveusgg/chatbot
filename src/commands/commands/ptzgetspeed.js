'use strict';

const ptzCommand = require('../utils/ptzCommand.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    return ptzCommand(controller, {
        name: 'ptzgetspeed',
        enabled: true,
        permission: {
            group: 'operator',
        },
        throttling: 'ptz',
        checkPtzLockout: false,
        run: async ({ channel, camera }) => {
            if (!camera) {
                // Couldn't find the camera
                return;
            }

            const camSpeed = await camera.getSpeed();
            controller.connections.twitch.send(channel, `PTZ Speed: ${camSpeed}`);
        },
    });
};
