'use strict';

const ptzCommand = require('../utils/ptzCommand.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    const { connections: { obsBot } } = controller;

    return ptzCommand(controller, {
        name: 'ptztracking',
        enabled: !!obsBot,
        permission: {
            group: 'mod',
        },
        throttling: 'ptz',
        run: async ({ args, rawArgs, currentScene, camera }) => {
            if (currentScene === 'nuthouse') {
                if (rawArgs.length === 0) {
                    return;
                }

                obsBot.setTracking(rawArgs[1].trim().toLowerCase());
            } else {
                if (!camera) {
                    // Couldn't find the camera
                    return;
                }

                const arg1Lower = args[1].toLowerCase();

                switch (arg1Lower) {
                    case '1':
                    case 'on':
                    case 'yes':
                        camera.enableAutoTracking();
                        camera.enableAutoFocus();
                        break;
                    case '0':
                    case 'off':
                    case 'no':
                        camera.disableAutoTracking();
                        camera.enableAutoFocus();
                        break;
                    default:
                        break;
                }
            }
        },
    });
};
