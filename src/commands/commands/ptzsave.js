'use strict';

const Logger = require('../../utils/logger.js');
const ptzCommandSetup = require('../utils/ptzCommandSetup.js');

const logger = new Logger();

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { api, obs, cameras, database } }) => {
    return {
        name: 'ptzsave',
        enabled: !!api && !!obs && !!cameras && !!database,
        permission: {
            group: 'operator',
        },
        throttling: 'ptz',
        run: async ({ args: _args }) => {
            const { args, camera, specificCamera, currentScene } =
                ptzCommandSetup(obs, cameras, database, _args);

            const position = await camera.getPosition();
            if (!position) {
                logger.log('Failed to get ptz position');
                return;
            }

            if (specificCamera) {
                if (args[1] !== '') {
                    database[specificCamera].presets[args[1]] = currentScene;
                } else {
                    database[currentScene].presets[specificCamera] =
                        currentScene;
                }
            } else {
                if (args[1] !== '') {
                    database[currentScene].presets[args[1]] = currentScene;
                } else {
                    database[currentScene].lastKnownPosition = currentScene;
                }
            }
        },
    };
};
