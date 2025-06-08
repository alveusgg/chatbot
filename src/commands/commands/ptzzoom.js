'use strict';

const ptzCommand = require('../utils/ptzCommand.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    return ptzCommand(controller, {
        name: 'ptzzoom',
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

            const arg1 = Number(args[1]);
            if (isNaN(arg1)) {
                return;
            }

            camera.ptz({ areazoom: `960,540,${arg1}` });
            camera.enableAutoFocus();
        },
    });
};
