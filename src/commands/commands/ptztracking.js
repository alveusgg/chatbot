'use strict';

const getCurrentScene = require('../utils/getCurrentScene.js');
const ptzCommandSetup = require('../utils/ptzCommandSetup.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs, obsBot, cameras, database } }) => {
    return {
        name: 'ptztracking',
        enabled: !!obs && !!obsBot && !!cameras && !!database,
        permission: {
            group: 'mod',
        },
        run: async ({ args: _args }) => {
            const currentScene = getCurrentScene();

            if (currentScene === 'nuthouse') {
                if (_args.length === 0) {
                    return;
                }

                obsBot.setTracking(_args[1].trim().toLowerCase());
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

                const arg1Lower = args[1].toLowerCase();

                switch (arg1Lower) {
                    case '1':
                    case 'on':
                    case 'yes':
                        camera.enableAutoTracking();
                        camera.enableAutoFocus();
                        break;
                    case '0':
                    case 'off':
                    case 'no':
                        camera.disableAutoTracking();
                        camera.enableAutoFocus();
                        break;
                    default:
                        break;
                }
            }
        },
    };
};
