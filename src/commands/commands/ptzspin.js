'use strict';

const ptzCommand = require('../utils/ptzCommand.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    return ptzCommand(controller, {
        name: 'ptzspin',
        enabled: true,
        permission: {
            group: 'operator',
        },
        throttling: 'ptz',
        run: async ({ args, camera }) => {
            if (!camera) {
                return;
            }

            const pan = Number(args[1]);
            const tilt = Number(args[2]);
            const zoom = Number(args[3]);

            if (isNaN(pan) || isNaN(tilt) || isNaN(zoom)) {
                return;
            }

            await camera.continuousPanTilt(pan, tilt, zoom);
        },
    });
};
