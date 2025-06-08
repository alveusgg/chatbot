'use strict';

const Logger = require('../../utils/logger.js');
const ptzCommand = require('../utils/ptzCommand.js');

const logger = new Logger();

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    const { connections: { database } } = controller;

    return ptzCommand(controller, {
        name: 'ptzsave',
        enabled: true,
        permission: {
            group: 'operator',
        },
        throttling: 'ptz',
        checkPtzLockout: false,
        run: async ({ args, camera, specificCamera, currentScene }) => {
            if (!camera) {
                return;
            }

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
    });
};
