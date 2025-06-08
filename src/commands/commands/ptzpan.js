'use strict';

const ptzCommand = require('../utils/ptzCommand.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    const { connections: { obsBot, twitch } } = controller;

    return ptzCommand(controller, {
        name: 'ptzpan',
        enabled: !!obsBot,
        permission: {
            group: 'operator',
        },
        throttling: 'ptz',
        run: async ({ channel, user, args, rawArgs, currentScene, ptzCameraName, camera }) => {
            if (currentScene === 'nuthouse') {
                obsBot.pan(rawArgs[1].toLowerCase().trim());
            } else {
                if (!camera) {
                    // Couldn't find the camera
                    return;
                }

                const arg1 = Number(args[1]);
                if (isNaN(arg1)) {
                    return;
                }

                camera.panCamera(arg1);
                camera.enableAutoFocus();

                if (channel === 'ptzapi') {
                    twitch.send(
                        channel,
                        `${user}: ptzpan ${ptzCameraName} ${args[1]}`,
                        true,
                    );
                }
            }
        },
    });
};
