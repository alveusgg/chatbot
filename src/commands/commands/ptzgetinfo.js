'use strict';

const Logger = require('../../utils/logger.js');
const ptzCommand = require('../utils/ptzCommand.js');

const logger = new Logger('src/commands/commands/ptzgetinfo');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    return ptzCommand(controller, {
        name: 'ptzgetinfo',
        enabled: true,
        permission: {
            group: 'user',
        },
        throttling: 'ptz',
        checkPtzLockout: false,
        run: async ({ channel, camera, currentScene }) => {
            if (!camera) {
                return;
            }

            const position = await camera.getPosition();

            if (!position || position.pan !== null) {
                logger.log('Failed to get ptz position');
                return;
            }

            // if (channel === 'ptzapi') {
            //     api.sendAPI(
            //         `PTZ Info (${currentScene}): ${position.pan}p |${
            //             position.tilt
            //         }t |${position.zoom}z |af ${position.autofocus || 'n/a'} |${
            //             position.focus || 'n/a'
            //         }f`,
            //     );
            // } else {
                controller.connections.twitch.send(
                    channel,
                    `PTZ Info (${currentScene}): ${position.pan}p |${
                        position.tilt
                    }t |${position.zoom}z |af ${position.autofocus || 'n/a'} |${
                        position.focus || 'n/a'
                    }f`,
                );
            // }
        },
    });
};
