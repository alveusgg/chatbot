'use strict';

const { cleanName } = require('../../utils/helper.js');
const Logger = require('../../utils/logger.js');
const config = require('../../config/config.js');
const ptzCommandSetup = require('../utils/ptzCommandSetup.js');

const logger = new Logger();

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { api, obs, cameras, database, twitch } }) => {
    return {
        name: 'ptzlist',
        enabled: !!api && !!obs && !!cameras && !!database,
        permission: {
            group: 'user',
        },
        throttling: 'ptz',
        run: async ({ channel, args: _args }) => {
            const { specificCamera, currentScene } = ptzCommandSetup(
                obs,
                cameras,
                database,
                _args,
            );

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
    };
};
