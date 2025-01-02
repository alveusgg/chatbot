'use strict';

const ptzCommandSetup = require('../utils/ptzCommandSetup.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { api, obs, cameras, database, twitch } }) => {
    return {
        name: 'ptzroaminfo',
        enabled: !!api && !!obs && !!cameras && !!database,
        permission: {
            group: 'mod',
        },
        throttling: 'ptz',
        run: async ({ channel, args: _args }) => {
            const { currentScene } = ptzCommandSetup(
                obs,
                cameras,
                database,
                _args,
            );
            const enabled = database[currentScene].isRoaming
                ? 'Enabled'
                : 'Disabled';

            await twitch.send(
                channel,
                `PTZ Roam: ${enabled} ${database[currentScene].roamTime} ${database[currentScene].roamSpeed} ${database[currentScene].roamList}`,
            );
        },
    };
};
