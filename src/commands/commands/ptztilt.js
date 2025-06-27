'use strict';

const ptzCommand = require('../utils/ptzCommand.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    const {
        connections: { obsBot, twitch },
    } = controller;

    return ptzCommand(controller, {
        name: 'ptztilt',
        enabled: !!obsBot,
        permission: {
            group: 'operator',
        },
        throttling: 'ptz',
        run: async ({ channel, user, args, rawArgs, currentScene, ptzCameraName, camera }) => {
            if (currentScene === 'nuthouse') {
                obsBot.tilt(rawArgs[1].trim().toLowerCase());
            } else {
                if (!camera) {
                    // Couldn't find the camera
                    return;
                }

                const arg1 = Number(args[1]);
                if (isNaN(arg1)) {
                    return;
                }

                camera.tiltCamera(arg1);
                camera.enableAutoFocus();

                if (channel === 'ptzapi') {
                    twitch.send(
                        channel,
                        `${user}: ptztilt ${ptzCameraName} ${args[1]}`,
                        true,
                    );
                }
            }
        },
    });
};
