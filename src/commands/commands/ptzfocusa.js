'use strict';

const ptzCommandSetup = require('../utils/ptzCommandSetup.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs, cameras, database } }) => {
    return {
        name: 'ptzfocusa',
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
            const arg1 = Number(arg1Lower);

            if (arg1 >= 1 && arg1 <= 9999) {
                camera.focusCameraExact(arg1);
            } else if (['on', 'yes', 'auto'].includes(arg1Lower)) {
                camera.enableAutoFocus();
            } else if (['off', 'no'].includes(arg1Lower)) {
                camera.disableAutoFocus();
            }
        },
    };
};
