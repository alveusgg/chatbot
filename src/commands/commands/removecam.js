'use strict';

const { customCommandAlias, multiCustomCamScenesConverted, multiCommands, safecams, customCamCommandMapping } = require('../../config/config.js');
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
        connections: { obs, database, twitch },
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

            const newListRemovedCams = [];
            const lockoutRemoveList = [];

            const argsList = args.slice(1);
            for (const arg of argsList) {
                if (arg === null || arg === '') {
                    continue;
                }

                let camName = cleanName(arg);

                const overrideArgs = customCommandAlias[camName];
                logger.log(
                    'removecam alias',
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

                    //removes all matching cam category
                    const baseCamName = multiCustomCamScenesConverted[overrideArgs] || overrideArgs;
                    const matchingcams = multiCommands[baseCamName];
                    if (matchingcams && matchingcams.length > 0){
                        for (const newarg of matchingcams) {
                            if (newarg != '' && newarg != arg && newarg != baseCamName && newarg != overrideArgs
                                && !argsList.includes(newarg)) {
                                argsList.push(newarg);
                            }
                        }
                    }
                } else {
                    //allow "all" to add all matching cam category
                    const match = camName.match(/(\w*?)all\W*/i);
                    if (match){
                        const basename = cleanName(match[1]);
                        const convertedbasename = customCommandAlias[basename];
                        const matchingcams = multiCommands[convertedbasename];
                        if (matchingcams && matchingcams.length > 0){
                            for (const newarg of matchingcams) {
                                if (newarg != "") {
                                    argsList.push(newarg);
                                }
                            }
                            continue;
                        }
                    }
                }

                lockoutRemoveList.push(camName);
            }

            //remove cams
			for (const i = 0; i < currentCamList.length; i++) {
				let currcam = currentCamList[i];
				currcam = cleanName(currcam);
				let remove = false;
				for (const removedcam of lockoutRemoveList){
					if (currcam == removedcam){
						remove = true;
					} else {
						const camMapping = customCamCommandMapping[removedcam];
						if (currcam == camMapping){
							remove = true;
						}
					}
				}
				if (remove){
					for (const replace of safecams){
						const camName = cleanName(replace);
						const baseName = customCommandAlias[camName];
						if (currentCamList.includes("fullcam"+replace) || currentCamList.includes("fullcam"+baseName)){
							continue;
						}
						if (newListRemovedCams.includes(baseName)){
							continue;
						}
                        newListRemovedCams.push(baseName);
						break;
					}
				} else {
					newListRemovedCams.push(currcam);
				}
			}

            if (newListRemovedCams.length > 0) {
                const fullArgs = newListRemovedCams.join(' ');

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

            if (lockoutRemoveList.length > 0) {
				const fullArgs = lockoutRemoveList.join(', ');
				logger.log(`Lock Cams - ${user}: ${fullArgs}`);
				const now = new Date();
				const lockoutTime = 0;
                const userGroup = config.groupMemberships[user];
                const accessLevel = config.newGroupsToOldMapping[userGroup];
				for (const cam of lockoutRemoveList) {
					database.lockoutCams[cam] = { user: user, accessLevel, locked: true, duration: lockoutTime, timestamp: now };
				}
				twitch.send(channel, `Removed and Locked Cams: ${fullArgs}`);
			}
        },
    };
};
