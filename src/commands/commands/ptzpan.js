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
        name: 'ptzpan',
        enabled: !!obs && !!cameras && !!database,
        permission: {
            group: 'operator',
        },
        run: async ({ channel, user, args: _args }) => {
            const currentScene = getCurrentScene(obs);

            if (currentScene === 'nuthouse') {
                obsBot.pan(_args[1].toLowerCase().trim());
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

                camera.panCamera(arg1);
                camera.enableAutoFocus();

                if (channel === 'ptzapi') {
                    twitch.send(
                        channel,
                        `${user}: ptzpan ${ptzCameraName} ${args[1]}`,
                        true,
                    );
                }
            }
        },
    };
};
