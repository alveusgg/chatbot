'use strict';

const ptzCommand = require('../utils/ptzCommand.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    const { connections: { database, twitch } } = controller;

    return ptzCommand(controller, {
        name: 'ptzspeed',
        enabled: true,
        permission: {
            group: 'operator',
        },
        throttling: 'ptz',
        run: async ({ channel, args, currentScene, camera }) => {
            if (!camera) {
                // Couldn't find the camera
                return;
            }

            if (args[1] !== '') {
                camera.setSpeed(args[1]);
                database[currentScene].speed = args[1];
            } else {
                const camSpeed = await camera.getSpeed();
                twitch.send(channel, `PTZ Speed: ${camSpeed}`);
            }
        },
    });
};
