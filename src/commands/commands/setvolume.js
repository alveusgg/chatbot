'use strict';

const {
    micGroups,
    sceneAudioSource,
    globalMusicSource,
    customCommandAlias,
} = require('../../config/config.js');
const checkLockoutAccess = require('../../utils/checkLockoutAccess.js');
const { cleanName } = require('../../utils/helper.js');
const getCurrentScene = require('../utils/getCurrentScene.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    const { connections: { obs, database, twitch } } = controller;
    return {
        name: 'setvolume',
        enabled: !!obs,
        permission: {
            group: 'vip',
        },
        run: async ({ channel, user, args }) => {
            const cameraName = args[1].trim().toLowerCase();
            const inputVolume = parseInt(args[2]);

            if (cameraName === 'all') {
                const scaledVol = inputVolume - 100;

                for (const source in micGroups.livecams) {
                    if (checkLockoutAccess(controller, micGroups.livecams['source'].name)) {
                        obs.local.setInputVolume(
                            micGroups.livecams[source].name,
                            scaledVol,
                        );
                    }
                }
            } else {
                const currentScene = await getCurrentScene(obs);

                const currentCustomScene =
                    cleanName(database['customcam'][0]) ?? currentScene;
                const currentSceneBase =
                    customCommandAlias[currentCustomScene] ??
                    currentCustomScene;

                let audioSource;
                switch (cameraName) {
                    case '':
                    case 'mic':
                    case 'mics':
                    case 'cam':
                    case 'cams':
                        audioSource = sceneAudioSource[currentSceneBase];
                        break;
                    case 'music':
                        audioSource = globalMusicSource;
                        break;
                    default: {
                        const cleanedArg1 = cleanName(args[1]) ?? '';
                        audioSource = sceneAudioSource[cleanedArg1];

                        if (audioSource === null || audioSource === '') {
                            audioSource = args[1];
                        }

                        break;
                    }
                }

                const scaledVolume = inputVolume - 100;
                if (args[1].includes('music')) {
                    audioSource = globalMusicSource;
                }

                if (checkLockoutAccess(controller, audioSource)) {
                    obs.local.setInputVolume(audioSource, scaledVolume);
                }

                if (audioSource === globalMusicSource) {
                    obs.cloud.setInputVolume(globalMusicSource, scaledVolume);
                }
            }

            if (channel === 'ptzapi') {
                twitch.send(
                    channel,
                    `${user}: setvolume ${args[1]} ${args[2]}`,
                    true,
                );
            }
        },
    };
};
