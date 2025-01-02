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
        name: 'addcam',
        enabled: !!obs && !!database,
        permission: {
            group: 'mod',
        },
        run: async ({ channel, user, args }) => {
            const currentScene = await getCurrentScene(obs);
            if (currentScene !== 'custom') {
                return;
            }

            const currentCamList = database['customcam'];
            const userCommand = database['customcamscommand'] ?? 'customcams';

            const newListAddCam = currentCamList.slice();

            for (const arg of args.slice(1)) {
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
                                newListAddCam.push(newArg);
                            }
                        }

                        continue;
                    }

                    camName = overrideArgs;
                }

                camName = `fullcam` + camName;

                // Add the camera
                if (!newListAddCam.includes(camName)) {
                    newListAddCam.push(camName);
                }
            }

            if (newListAddCam.length > 0) {
                const fullArgs = newListAddCam.join(' ');

                logger.level(`Add Cams: ${args} - new fullargs: ${fullArgs}`);
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
