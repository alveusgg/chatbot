'use strict';

const ptzCommand = require('../utils/ptzCommand.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    return ptzCommand(controller, {
        name: 'ptzhomeold',
        enabled: true,
        permission: {
            group: 'operator',
        },
        throttling: 'ptz',
        run: async ({ camera }) => {
            if (!camera) {
                return;
            }

            camera.goHome();
            camera.enableAutoFocus();
        },
    });
};
