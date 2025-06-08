'use strict';

const getCurrentScene = require('../utils/getCurrentScene.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs, obsBot } }) => {
    return {
        name: 'ptzwake',
        enabled: !!obs && !!obsBot,
        permission: {
            group: 'mod',
        },
        throttling: 'ptz',
        run: async () => {
            const currentScene = await getCurrentScene(obs);
            if (currentScene !== 'nuthouse') {
                return;
            }

            obsBot.wake();
        },
    };
};
