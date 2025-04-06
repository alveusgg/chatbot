'use strict';

const Logger = require('../../utils/logger.js');
const ptzCommandSetup = require('../utils/ptzCommandSetup.js');

const logger = new Logger('src/commands/commands/ptzfetchimg');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { api, obs, cameras, database } }) => {
    return {
        name: 'ptzfetchimg',
        enabled: !!api && !!obs && !!cameras && !!database,
        permission: {
            group: 'operator',
        },
        run: async ({ channel, args: _args, user }) => {
            if (channel !== 'ptzapi') {
                return;
            }

            const { args, camera, specificCamera, currentScene } =
                ptzCommandSetup(obs, cameras, database, _args);

            // Try to fetch the screenshot
            const imageBase64 = await camera.fetchImage();
            if (!imageBase64) {
                logger.log('Failed to fetch image after saving request');
                return;
            }

            // Prepare message to send to api
            const message = {
                image: imageBase64,
                camera: specificCamera || currentScene,
                preset: args[1],
                user,
            };

            // Send to websocket
            await api.sendBroadcastMessage(message, 'image');

            logger.log('Sending image');
        },
    };
};
