'use strict';

const {
    customCommandAlias,
    axisCameraCommandMapping,
} = require('../../config/config.js');
const { cleanName } = require('../../utils/helper.js');
const getCurrentScene = require('../utils/getCurrentScene.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { api, database, obs, twitch } }) => {
    return {
        name: 'scenecams',
        enabled: !!database && !!obs,
        permission: {
            group: 'vip',
        },
        run: async ({ channel, args }) => {
            const currentScene = await getCurrentScene(obs);

            const arg1 = args[1].trim().toLowerCase();

            const currentCamList = database['customcam'];
            let cameraOutput = '';
            switch (arg1) {
                case 'json': {
                    cameraOutput = JSON.stringify(currentCamList);
                    break;
                }
                case 'jsonmap': {
                    const jsonObj = {};

                    for (let i = 0; i < currentCamList.length; i++) {
                        jsonObj[i + 1] = currentCamList[i];
                    }

                    cameraOutput = JSON.stringify(jsonObj);
                    break;
                }
                default: {
                    for (let i = 0; i < currentCamList.length; i++) {
                        let ptzCameraName = cleanName(currentCamList[i]);

                        const baseName =
                            customCommandAlias[ptzCameraName] ?? ptzCameraName;

                        ptzCameraName =
                            axisCameraCommandMapping[baseName] ?? baseName;

                        cameraOutput += `${i + 1}: ${ptzCameraName}`;
                        if (i !== currentCamList.length - 1) {
                            cameraOutput += `${cameraOutput}, `;
                        }
                    }

                    break;
                }
            }

            const sceneCommand = database['customcamscommand'];

            // Create final output with both scene and cams
            let finalOutput = {
                scene: sceneCommand,
                currentScene,
                cams: cameraOutput,
            };

            if (arg1 === 'json' || arg1 === 'jsonmap') {
                finalOutput = JSON.stringify(finalOutput);

                // For JSON formats, stringify the final output
                if (channel === 'ptzapi') {
                    api.sendAPI(finalOutput);
                } else {
                    twitch.send(channel, finalOutput);
                }
            } else {
                // For plain text or other formats, manually format and include both scene and cams
                const formattedOutput = `Scene: ${finalOutput.scene}\nCurrent Scene: ${finalOutput.currentScene}\nCams: ${finalOutput.cams}`;

                if (channel === 'ptzapi') {
                    api.sendAPI(formattedOutput);
                } else {
                    twitch.send(channel, formattedOutput);
                }
            }
        },
    };
};
