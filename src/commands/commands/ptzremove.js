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
        name: 'ptzremove',
        enabled: true,
        permission: {
            group: 'operator',
        },
        throttling: 'ptz',
        run: async ({ args, camera, specificCamera, currentScene }) => {
            if (specificCamera) {
                if (args[1] !== '') {
                    if (database[specificCamera].presets[args[1]] !== null) {
                        const response =
                            delete database[specificCamera].presets[args[1]];

                        if (response === true) {
                            // await api.sendBroadcastMessage(
                            //     `ptzremove ${specificCamera} ${args[1]}`,
                            //     'backend',
                            // );
                        } else {
                            logger.log(
                                `Failed to remove preset ${args[1]}: ${response} ${database[specificCamera]}`,
                            );
                        }
                    }
                } else {
                    const position = await camera.getPosition();
                    database[currentScene].presets[specificCamera] = position;
                }
            } else {
                if (database[currentScene].presets[args[1]] !== null) {
                    const response =
                        delete database[currentScene].presets[args[1]];

                    if (response !== true) {
                        logger.log(
                            `Failed to remove preset ${args[1]}: ${response} ${database[currentScene]}`,
                        );
                    }
                }
            }
        },
    });
};
