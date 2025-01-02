'use strict';

const {
    commandScenesCloud,
    pauseCloudSceneChange,
} = require('../../config/config.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs } }) => {
    const commandScenesCloudKeys = Object.keys(commandScenesCloud);

    /**
     * @type {Array<import('../types.d.ts').Command>}
     */
    const commands = new Array(commandScenesCloudKeys.length);

    for (let i = 0; i < commandScenesCloudKeys.length; i++) {
        const commandName = commandScenesCloudKeys[i];

        commands[i] = {
            name: commandName,
            enabled: !!obs,
            run: async () => {
                if (pauseCloudSceneChange) {
                    return;
                }

                setTimeout(() => {
                    const sceneName = commandScenesCloud[commandName];

                    obs.cloud.setScene(sceneName);
                }, 500);
            },
        };
    }

    return commands;
};
