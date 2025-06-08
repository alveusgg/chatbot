'use strict';

const { customCommandAlias } = require('../../config/config.js');
const { groupMemberships } = require('../../config/config.js');
const { cleanName } = require('../../utils/helper.js');
const Logger = require('../../utils/logger.js');
const switchToCustomCams = require('../../utils/switchToCustomCams.js');
const getCurrentScene = require('../utils/getCurrentScene.js');

const logger = new Logger();

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    const {
        connections: { obs, database },
    } = controller;

    return {
        name: 'removecam',
        enabled: !!obs && !!database,
        permission: {
            group: 'vip',
        },
        run: async ({ channel, user, args }) => {
            const currentScene = await getCurrentScene(obs);

            if (currentScene !== 'custom') {
                return;
            }

            const currentCamList = database['customcam'];
            const userCommand = database['customcamscommand'] ?? 'customcams';

            const newListRemoveCam = currentCamList.slice();

            const argsList = args.slice(1);
            for (const arg of argsList) {
                if (arg === null || arg === '') {
                    continue;
                }

                let camName = cleanName(arg);

                const overrideArgs = customCommandAlias[camName];
                logger.log(
                    'addcam alias',
                    customCommandAlias,
                    camName,
                    overrideArgs,
                );

                if (overrideArgs !== null) {
                    // Allow alias to change entire argument
                    const newArgs = overrideArgs.split(' ');

                    if (newArgs.length > 1) {
                        for (const newArg of newArg) {
                            if (newArg !== '') {
                                argsList.push(newArg);
                            }
                        }

                        continue;
                    }

                    camName = overrideArgs;
                }

                // Remove the camera
                for (let i = 0; i < newListRemoveCam.length; i++) {
                    if (newListRemoveCam[i].includes(camName)) {
                        newListRemoveCam.splice(i, 1);
                    }
                }
            }

            if (newListRemoveCam.length > 0) {
                const fullArgs = newListRemoveCam.join(' ');

                logger.level(
                    `Remove Cams: ${args} - new fullargs: ${fullArgs}`,
                );
                switchToCustomCams(
                    controller,
                    channel,
                    groupMemberships[user],
                    userCommand,
                    fullArgs,
                );
            }
        },
    };
};
