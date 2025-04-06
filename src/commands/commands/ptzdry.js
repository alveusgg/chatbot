'use strict';

const ptzCommandSetup = require('../utils/ptzCommandSetup.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { api, obs, cameras, database } }) => {
    return {
        name: 'ptzdry',
        enabled: !!api && !!obs && !!cameras && !!database,
        permission: {
            group: 'operator',
        },
        run: async ({ args: _args }) => {
            const { camera } = ptzCommandSetup(obs, cameras, database, _args);

            await camera.speedDry();
        },
    };
};
