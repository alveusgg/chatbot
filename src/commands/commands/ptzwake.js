'use strict';

const getCurrentScene = require('../utils/getCurrentScene.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obsBot } }) => {
    return {
        name: 'ptzwake',
        enabled: !!obsBot,
        permission: {
            group: 'mod',
        },
        throttling: 'ptz',
        run: async () => {
            if (await getCurrentScene() !== 'nuthouse') {
                return;
            }

            obsBot.wake();
        },
    };
};
