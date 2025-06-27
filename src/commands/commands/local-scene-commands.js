'use strict';

const {
    commandScenes,
    onewayCommands,
    multiCustomCamScenesConverted,
} = require('../../config/config.js');
const { groupMemberships } = require('../../config/config.js');
const {
    isCommandTimeRestricted,
} = require('../utils/canUserPerformCommand.js');
const getCurrentScene = require('../utils/getCurrentScene.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    const {
        connections: { obs },
    } = controller;
    const commandSceneKeys = Object.keys(commandScenes);

    /**
     * @type {Array<import('../types.d.ts').Command>}
     */
    const commands = new Array(commandSceneKeys.length);

    for (let i = 0; i < commandSceneKeys.length; i++) {
        const commandName = commandSceneKeys[i];

        commands[i] = {
            name: 'alveuspc'+commandName,
            enabled: !!obs,
            skipTimeRestrictionCheck: true,
            run: async ({ user }) => {
                let hasAccess = isCommandTimeRestricted(
                    groupMemberships[user],
                    { name: commandName },
                    controller,
                );

                const currentScene = await getCurrentScene(obs);

                // Multicommand swapping
                if (!hasAccess) {
                    let newCamBase = multiCustomCamScenesConverted[commandName];
			        let currentCamBase = multiCustomCamScenesConverted[currentScene];
			        if (newCamBase == currentCamBase && newCamBase != null){
			        	hasAccess = true;
                    }

                    //One Direction Swapping (if on scene, allow subscene)
                    let onWayList = onewayCommands[currentScene] || null;
                    if (onWayList != null) {
                        if (onWayList.includes(commandName)) {
                            hasAccess = true;
                        }
                    }
                }

                if (hasAccess) {
                    await obs.local.setScene(commandScenes[commandName]);
                }
            },
        };
    }

    return commands;
};
