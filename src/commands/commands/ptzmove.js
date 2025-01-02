'use strict';

const ptzCommandSetup = require('../utils/ptzCommandSetup.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs, cameras, database, twitch } }) => {
    return {
        name: 'ptzmove',
        enabled: !!obs && !!cameras && !!database,
        permission: {
            group: 'operator',
        },
        throttling: 'ptz',
        run: async ({ channel, user, args: _args }) => {
            const { ptzCameraName, camera, args } = ptzCommandSetup(
                obs,
                cameras,
                database,
                _args,
            );

            if (!camera) {
                // Couldn't find the camera
                return;
            }

            camera.moveCamera(args[1]);
            camera.enableAutoFocus();

            if (channel === 'ptzapi') {
                twitch.send(
                    channel,
                    `${user}: ptzmove ${ptzCameraName} ${args[1]}`,
                    true,
                );
            }
        },
    };
};
