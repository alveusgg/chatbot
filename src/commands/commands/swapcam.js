'use strict';

const { customCommandAlias, throttleSwapCommandLength } = require('../../config/config.js');
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
        name: 'swapcam',
        enabled: !!obs && !!database,
        permission: {
            group: 'vip',
        },
        throttling: {
            durationMs: throttleSwapCommandLength
        },
        run: async ({ channel, user, args }) => {
            const currentScene = await getCurrentScene(obs);

            if (currentScene !== 'custom') {
                return;
            }

            const currentCamList = database['customcam'];
            const userCommand = database['customcamscommand'] ?? 'customcams';

            if (args[1] === '' || args[2] === '') {
                if (currentCamList.length !== 2) {
                    return;
                }

                const temp = currentCamList[0];
                currentCamList[0] = currentCamList[1];
                currentCamList[1] = temp;

                const fullArgs = currentCamList.join(' ');

                switchToCustomCams(
                    controller,
                    channel,
                    groupMemberships[user],
                    userCommand,
                    fullArgs,
                );

                return;
            }

            let cam1 = cleanName(args[1]);
            cam1 = customCommandAlias[cam1] || cam1;
            cam1 = `fullcam${cam1}`;

            let pos1 = currentCamList.indexOf(cam1);
            if (pos1 === -1) {
                // Get cam at location
                pos1 = parseInt(args[1]);

                if (!isNaN(pos1)) {
                    pos1 = pos1 - 1;
                } else {
                    pos1 = null;
                }
            }

            let cam2 = cleanName(args[2]);
            cam2 = customCommandAlias[cam2] || cam2;
            cam2 = `fullcam${cam2}`;

            let pos2 = currentCamList.indexOf(cam2);
            if (pos2 === -1) {
                // Get cam at location
                pos2 = parseInt(args[12]);

                if (!isNaN(pos2)) {
                    pos2 = pos2 - 1;
                } else {
                    pos2 = null;
                }
            }

            // If both are valid cams or positions, swap them
            // If not, replace pos1 with cam2
            let newList = currentCamList.slice();

            if (pos1 != null && pos2 != null) {
                let temp1 = newList[pos1];
                newList[pos1] = newList[pos2];
                newList[pos2] = temp1;
            } else if (pos1 != null) {
                newList[pos1] = cam2;
            } else if (pos2 != null) {
                newList[pos2] = cam1;
            } else {
                return;
            }

            // Fill empty slots with nocam
            for (let i = 0; i < newList.length; i++) {
                if (newList[i] == null || newList[i] == '') {
                    newList[i] = 'fullcamremove';
                }
            }
            newList = newList.filter((i) => i != 'fullcamremove');

            if (newList.length > 0) {
                const fullArgs = newList.join(' ');

                logger.log(
                    `Swap Cam ${cam1} to ${cam2} - fullargs: ${fullArgs}`,
                );
                switchToCustomCams(
                    controller,
                    channel,
                    groupMemberships[user],
                    userCommand,
                    fullArgs,
                );

                if (channel === 'ptzapi') {
                    twitch.send(
                        channel,
                        `${user}: Swap ${args[1]} ${args[2]}`,
                        true,
                    );
                }
            }
        },
    };
};
