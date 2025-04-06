'use strict';

const Logger = require('../../utils/logger.js');
const ptzCommandSetup = require('../utils/ptzCommandSetup.js');

const logger = new Logger();

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { api, obs, cameras, database } }) => {
    return {
        name: 'ptzrename',
        enabled: !!obs && !!cameras && !!database,
        permission: {
            group: 'operator',
        },
        run: async ({ args: _args }) => {
            const { args, specificCamera, currentScene } = ptzCommandSetup(
                obs,
                cameras,
                database,
                _args,
            );

            if (specificCamera) {
                if (args[1] && args[2]) {
                    if (database[specificCamera].presets[args[1]] !== null) {
                        database[specificCamera].presets[args[2]] =
                            database[specificCamera].presets[args[1]];

                        const response =
                            delete database[specificCamera].presets[args[1]];

                        if (response) {
                            api.sendBroadcastMessage(
                                `ptzrename ${specificCamera} ${args[1]} ${args[2]}`,
                                'backend',
                            );
                        } else {
                            logger.log(
                                `Failed to remove preset ${args[1]}: ${response} ${database[specificCamera]}`,
                            );
                        }
                    }
                } else {
                    if (
                        database[currentScene].presets[specificCamera] !== null
                    ) {
                        database[currentScene].presets[args[1]] =
                            database[currentScene].presets[specificCamera];

                        const response =
                            delete database[currentScene].presets[
                                specificCamera
                            ];
                        if (response) {
                            logger.log(
                                `Failed to remove preset ${specificCamera}: ${response} ${database[currentScene]}`,
                            );
                        }
                    }
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
    };
};
