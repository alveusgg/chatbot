'use strict';

const ptzCommand = require('../utils/ptzCommand.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    return ptzCommand(controller, {
        name: 'ptzdry',
        enabled: true,
        permission: {
            group: 'operator',
        },
        throttling: 'ptz',
        checkPtzLockout: false,
        run: async ({ camera }) => {
            if (!camera) {
                return;
            }

            await camera.speedDry();
        },
    });
};
