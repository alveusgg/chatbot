'use strict';

const ptzCommand = require('../utils/ptzCommand.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    const { connections: { obsBot } } = controller;

    return ptzCommand(controller, {
        name: 'ptzpreset',
        enabled: !!obsBot,
        permission: {
            group: 'user',
        },
        throttling: 'ptz',
        run: async ({ args, rawArgs, currentScene, camera, specificCamera }) => {
            if (currentScene === 'nuthouse') {
                let num;
                switch (rawArgs[0]?.trim()?.toLowerCase() || '') {
                    case 'table':
                    case 'bench':
                        num = 2;
                        break;
                    case 'room':
                        num = 3;
                        break;
                    case 'counter':
                    default:
                        num = 1;
                        break;
                }

                obsBot.setPreset(num);
            } else {
                if (!camera) {
                    // Couldn't find the camera
                    return;
                }

                const arg1Lower = args[1].toLowerCase();
                if (specificCamera) {
                    // Used camera name
                    if (arg1Lower !== '') {
                        // 2nd argument provided
                        camera.goToPreset(arg1Lower);
                    } else {
                        camera.goToPreset(specificCamera);
                    }
                } else {
                    camera.goToPreset(arg1Lower);
                }

                camera.enableAutoFocus();
            }
        },
    });
};
