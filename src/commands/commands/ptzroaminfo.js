'use strict';

const ptzCommand = require('../utils/ptzCommand.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    const { connections: { database, twitch } } = controller;

    return ptzCommand(controller, {
        name: 'ptzroaminfo',
        enabled: true,
        permission: {
            group: 'mod',
        },
        throttling: 'ptz',
        checkPtzLockout: false,
        run: async ({ channel, currentScene }) => {
            const enabled = database[currentScene].isRoaming
                ? 'Enabled'
                : 'Disabled';

            await twitch.send(
                channel,
                `PTZ Roam: ${enabled} ${database[currentScene].roamTime} ${database[currentScene].roamSpeed} ${database[currentScene].roamList}`,
            );
        },
    });
};
