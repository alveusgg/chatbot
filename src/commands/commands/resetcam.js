'use strict';

const { customCommandAlias } = require('../../config/config.js');
const { cleanName } = require('../../utils/helper.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs, twitch } }) => {
    return {
        name: 'resetcam',
        enabled: !!obs,
        permission: {
            group: 'vip',
        },
        run: ({ user, channel, args }) => {
            const cleanedArg1 = cleanName(args[1]) ?? '';

            let cameraName = customCommandAlias[cleanedArg1] || cleanedArg1;
            cameraName = `fullcam ${cameraName}`;

            obs.local.restartSceneItem(obs.local.currentScene, cameraName);

            if (channel === 'ptzapi') {
                twitch.send(channel, `${user}: resetcam ${cameraName}`, true);
            }
        },
    };
};
