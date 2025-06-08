'use strict';

const { cleanName } = require('../../utils/helper.js');
const Logger = require('../../utils/logger.js');
const config = require('../../config/config.js');
const ptzCommand = require('../utils/ptzCommand.js');

const logger = new Logger();

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    const { connections: { database, twitch } } = controller;

    return ptzCommand(controller, {
        name: 'ptzlist',
        enabled: true,
        permission: {
            group: 'user',
        },
        throttling: 'ptz',
        checkPtzLockout: false,
        run: async ({ channel, args, specificCamera, currentScene }) => {
            logger.log('ptzlist', specificCamera, args[1]);

            if (specificCamera) {
                twitch.send(channel, `PTZ Presets: ${Object.keys(database[specificCamera].presets).sort().toString()}`)
            } else {
                let ptzcamName;
                const currentCamList = database['customcam'];

                let output = "";
                for (let i = 0; i < currentCamList.length; i++) {
                    ptzcamName = cleanName(currentCamList[i]);
                    let baseName = config.customCommandAlias[ptzcamName] ?? ptzcamName;
                    ptzcamName = config.axisCameraCommandMapping[baseName] ?? baseName;
                    output = `${output}${i + 1}: ${ptzcamName}`;
                    if (i != currentCamList.length - 1) {
                        output = `${output}, `;
                    }
                }
                const formattedOutput = `Current Scene: ${currentScene.toLowerCase()} \nCams: ${output}`;
                twitch.send(channel, formattedOutput);
            }
        },
    });
};
