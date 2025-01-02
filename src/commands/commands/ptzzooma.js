'use strict';

const getCurrentScene = require('../utils/getCurrentScene.js');
const ptzCommandSetup = require('../utils/ptzCommandSetup.js');
const toNumber = require('../utils/toNumber.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs, obsBot, cameras, database } }) => {
    return {
        name: 'ptzzooma',
        enabled: !!obs && !!obsBot && !!cameras && !!database,
        permission: {
            group: 'user',
        },
        throttling: 'ptz',
        run: async ({ args: _args }) => {
            const currentScene = await getCurrentScene(obs);

            if (currentScene === 'nuthouse') {
                obsBot.setZoom(_args[1].trim().toLowerCase());
            } else {
                const { camera, args } = ptzCommandSetup(
                    obs,
                    cameras,
                    database,
                    _args,
                );

                if (!camera) {
                    // Couldn't find the camera
                    return;
                }

                camera.zoomCameraExact(args[1]);
                camera.enableAutoFocus();
            }
        },
    };
};
