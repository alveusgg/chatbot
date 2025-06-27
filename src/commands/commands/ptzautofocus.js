'use strict';

const ptzCommand = require('../utils/ptzCommand.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    return ptzCommand(controller, {
        name: 'ptzautofocus',
        enabled: true,
        permission: {
            group: 'user',
        },
        throttling: 'ptz',
        run: async ({ camera, args }) => {
            if (!camera) {
                // Couldn't find the camera
                return;
            }

            const arg1Lower = args[1].toLowerCase();

            switch (arg1Lower) {
                case '1':
                case 'on':
                case 'yes':
                    camera.enableAutoFocus();
                    break;
                case '0':
                case 'off':
                case 'no':
                    camera.disableAutoFocus();
                    break;
                default:
                    break;
            }
        },
    });
};
