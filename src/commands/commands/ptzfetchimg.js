'use strict';

const { customCommandAlias } = require('../../config/config.js');
const Logger = require('../../utils/logger.js');
const ptzCommand = require('../utils/ptzCommand.js');
const ptzCommandSetup = require('../utils/ptzCommandSetup.js');

const logger = new Logger('src/commands/commands/ptzfetchimg');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    // const { connections: { api, database } } = controller;

    return ptzCommand(controller, {
        name: 'ptzfetchimg',
        enabled: false,
        permission: {
            group: 'operator',
        },
        throttling: 'ptz',
        run: async ({ /* channel, args, user, camera, specificCamera, currentScene */ }) => {
            // if (channel !== 'ptzapi') {
            //     return;
            // }

            // const currentCamList = database['customcams'];

            // let allowedCam = false;
            // for (let i = 0; i < currentCamList.length; i++) {
            //     let currentPTZName = helper.cleanName(currentCamList[i]);
            //     let currentBaseName = customCommandAlias[currentPTZName] ?? currentPTZName;
            //     if (baseName == currentBaseName){
            //         allowedCam = true;
            //         break;
            //     }
            // }
            // if (!allowedCam){
			// 	logger.log(`Fetch Image: Invalid Permission - ${specificCamera}`);
			// 	return;
			// }

            // // Try to fetch the screenshot
            // const imageBase64 = await camera.fetchImage();
            // if (!imageBase64) {
            //     logger.log('Failed to fetch image after saving request');
            //     return;
            // }

            // // Prepare message to send to api
            // const message = {
            //     image: imageBase64,
            //     camera: specificCamera || currentScene,
            //     preset: args[1],
            //     user,
            // };

            // // Send to websocket
            // await api.sendBroadcastMessage(message, 'image');

            // logger.log('Sending image');
        },
    });
};
