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

            await api.sendBroadcastMessage(
                `ptzsave ${specificCamera} ${args[1]}`,
                'backend',
            );

            // Fetch screenshot after saving the preset
            const imageBase64 = await camera.fetchImage();
            if (!imageBase64) {
                logger.log('Failed to fetch image after saving preset');
                return;
            }

            const message = {
                image: imageBase64,
                camera: specificCamera || currentScene,
                preset: args[1],
            };

            await api.sendBroadcastMessage(message, 'image');
        },
    };
};
