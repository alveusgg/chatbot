'use strict';

const ptzCommandSetup = require('../utils/ptzCommandSetup.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs, cameras, database } }) => {
    return {
        name: 'ptzautofocus',
        enabled: !!obs && !!cameras && !!database,
        permission: {
            group: 'user',
        },
        throttling: 'ptz',
        run: async ({ args: _args }) => {
            const { camera, args } = ptzCommandSetup(
                obs,
                cameras,
                database,
                _args,
            );

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
    };
};
