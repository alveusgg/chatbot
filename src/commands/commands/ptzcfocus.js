'use strict';

const ptzCommand = require('../utils/ptzCommand.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    return ptzCommand(controller, {
        name: 'ptzcfocus',
        enabled: true,
        permission: {
            group: 'operator',
        },
        throttling: 'ptz',
        run: async ({ args, camera }) => {
            if (!camera) {
                // Couldn't find the camera
                return;
            }

            const arg1Lower = args[1].toLowerCase();
            const arg1 = Number(arg1Lower);

            if (arg1Lower === 'off' || arg1 === 0) {
                camera.continuousFocus(0);
                return;
            }

            if (arg1 >= -100 && arg1 <= 100) {
                camera.continuousFocus(arg1);
            }
        },
    });
};
