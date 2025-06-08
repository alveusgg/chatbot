'use strict';

const ptzCommand = require('../utils/ptzCommand.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    return ptzCommand(controller, {
        name: 'ptzirlight',
        enabled: true,
        permission: {
            group: 'mod',
        },
        throttling: 'ptz',
        run: async ({ args, camera }) => {
            if (!camera) {
                return;
            }

            switch (args[1]) {
                case '1':
                case 'on':
                case 'yes':
                    camera.enableIR();
                    break;
                default:
                    camera.disableIR();
                    break;
            }
        },
    });
};
