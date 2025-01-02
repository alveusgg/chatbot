'use strict';

const getCurrentScene = require('../utils/getCurrentScene.js');
const ptzCommandSetup = require('../utils/ptzCommandSetup.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({
    connections: { obs, obsBot, cameras, database, twitch },
}) => {
    return {
        name: 'ptztilt',
        enabled: !!obs && !!obsBot && !!cameras && !!database,
        permission: {
            group: 'operator',
        },
        throttling: 'ptz',
        run: async ({ channel, user, args: _args }) => {
            const currentScene = await getCurrentScene(obs);

            if (currentScene === 'nuthouse') {
                obsBot.tilt(_args[1].trim().toLowerCase());
            } else {
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

                const arg1 = Number(args[1]);
                if (isNaN(arg1)) {
                    return;
                }

                camera.tiltCamera(arg1);
                camera.enableAutoFocus();

                if (channel === 'ptzapi') {
                    twitch.send(
                        channel,
                        `${user}: ptztilt ${ptzCameraName} ${args[1]}`,
                        true,
                    );
                }
            }
        },
    };
};
