'use strict';

const Logger = require('../../utils/logger.js');
const ptzCommandSetup = require('../utils/ptzCommandSetup.js');

const logger = new Logger();

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { api, obs, cameras, database } }) => {
    return {
        name: 'ptzremove',
        enabled: !!obs && !!cameras && !!database,
        permission: {
            group: 'operator',
        },
        run: async ({ args: _args }) => {
            const { args, camera, specificCamera, currentScene } =
                ptzCommandSetup(obs, cameras, database, _args);

            if (specificCamera) {
                if (args[1] !== '') {
                    if (database[specificCamera].presets[args[1]] !== null) {
                        const response =
                            delete database[specificCamera].presets[args[1]];

                        if (response === true) {
                            await api.sendBroadcastMessage(
                                `ptzremove ${specificCamera} ${args[1]}`,
                                'backend',
                            );
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
    };
};
