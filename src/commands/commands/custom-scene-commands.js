'use strict';

const {
    customSceneCommands,
    customCommandAlias,
} = require('../../config/config.js');
const { groupMemberships } = require('../../config/config.js');
const switchToCustomCams = require('../../utils/switchToCustomCams.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    const {
        connections: { api, database, obs, twitch },
    } = controller;
    const customSceneCommandsKeys = Object.keys(customSceneCommands);

    /**
     * @type {Array<import('../types.d.ts').Command>}
     */
    const commands = new Array(customSceneCommandsKeys.length);

    for (let i = 0; i < customSceneCommandsKeys.length; i++) {
        const commandName = customSceneCommands[i];

        commands[i] = {
            name: commandName,
            enabled: !!api && !!database && !!obs && !!twitch,
            run: async ({ channel, user }) => {
                let sceneName = commandName;

                if (sceneName in customCommandAlias) {
                    sceneName = customCommandAlias[sceneName];
                }

                const userGroup = groupMemberships[user];

                await switchToCustomCams(
                    controller,
                    channel,
                    userGroup,
                    commandName,
                    sceneName,
                );
            },
        };
    }

    return commands;
};
