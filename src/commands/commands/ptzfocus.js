'use strict';

const ptzCommand = require('../utils/ptzCommand.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    return ptzCommand(controller, {
        name: 'ptzfocus',
        enabled: true,
        permission: {
            group: 'user',
        },
        throttling: 'ptz',
        run: async ({ args, camera }) => {
            if (!camera) {
                // Couldn't find the camera
                return;
            }

            const arg1Lower = args[1].toLowerCase();
            const arg1 = Number(arg1Lower);

            if (arg1 >= -9999 && arg1 <= 9999) {
                camera.focusCamera(arg1);
            } else if (['on', 'yes', 'auto'].includes(arg1Lower)) {
                camera.enableAutoFocus();
            } else if (['off', 'no'].includes(arg1Lower)) {
                camera.disableAutoFocus();
            }
        },
    });
};
