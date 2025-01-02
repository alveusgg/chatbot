'use strict';

const ptzCommand = require('../utils/ptzCommand.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    const { connections: { obsBot } } = controller;

    return ptzCommand(controller, {
        name: 'ptzspin',
        enabled: !!obsBot,
        permission: {
            group: 'operator',
        },
        throttling: 'ptz',
        run: async ({ currentScene, camera }) => {
            if (currentScene === 'nuthouse') {
                obsBot.stop();
            } else {
                if (!camera) {
                    return;
                }

                await camera.continuousPanTilt(0, 0, 0);
            }
        },
    });
};
