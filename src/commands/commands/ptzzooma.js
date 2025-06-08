'use strict';

const ptzCommand = require('../utils/ptzCommand.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    const { connections: { obsBot } } = controller;

    return ptzCommand(controller, {
        name: 'ptzzooma',
        enabled: !!obsBot,
        permission: {
            group: 'user',
        },
        throttling: 'ptz',
        run: async ({ args, rawArgs, currentScene, camera }) => {
            if (currentScene === 'nuthouse') {
                obsBot.setZoom(rawArgs[1].trim().toLowerCase());
            } else {
                if (!camera) {
                    // Couldn't find the camera
                    return;
                }

                camera.zoomCameraExact(args[1]);
                camera.enableAutoFocus();
            }
        },
    });
};
