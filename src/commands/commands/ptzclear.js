'use strict';

const ptzCommand = require('../utils/ptzCommand.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    return ptzCommand(controller, {
        name: 'ptzclear',
        enabled: true,
        permission: {
            group: 'superUser',
        },
        throttling: 'ptz',
        run: async ({ specificCamera, currentScene }) => {
            controller.connections.database[specificCamera ?? currentScene].presets = {};
        },
    });
};
