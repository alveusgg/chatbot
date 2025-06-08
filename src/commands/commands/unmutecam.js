'use strict';

const {
    sceneAudioSource,
    customCommandAlias,
    globalMusicSource,
    micGroups,
} = require('../../config/config.js');
const { groupMemberships } = require('../../config/config.js');
const checkLockoutAccess = require('../../utils/checkLockoutAccess.js');
const { cleanName } = require('../../utils/helper.js');
const getCurrentScene = require('../utils/getCurrentScene.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    const { connections: { obs, database } } = controller;
    return {
        name: 'unmutecam',
        enabled: !!obs,
        permission: {
            group: 'mod',
        },
        run: async ({ user, args }) => {
            const currentScene = await getCurrentScene(obs);

            const currentCustomScene =
                cleanName(database['customcam'][0]) ?? currentScene;
            const currentSceneBase =
                customCommandAlias[currentCustomScene] ?? currentCustomScene;

            const arg1 = args[1].trim().toLowerCase();
            switch (arg1) {
                case 'all': {
                    for (const source in micGroups.livecams) {
                        if (!checkLockoutAccess(controller, micGroups["livecams"][source].name)) {
                            continue;
                        }

                        obs.local.setInputVolume(
                            micGroups.livecams[source].name,
                            micGroups.livecams[source].volume,
                        );

                        obs.local.setMute(
                            micGroups.livecams[source].name,
                            false,
                        );
                    }

                    obs.cloud.setMute(globalMusicSource, true);
                    break;
                }
                case 'music': {
                    obs.cloud.setMute(globalMusicSource, false);
                    break;
                }
                default: {
                    let audioSource;
                    if (arg1 === '' || arg1 === 'mic') {
                        audioSource = sceneAudioSource[currentSceneBase];
                    } else {
                        let arg1Base = customCommandAlias[args[1]];
                        if (!arg1Base) {
                            arg1Base = cleanName(args[1]) ?? '';
                        }

                        audioSource = sceneAudioSource[arg1Base];
                        if (audioSource === null || audioSource === '') {
                            audioSource = arg1;
                        }

                        let hasAccess = false;
                        if (
                            Object.keys(micGroups.livecams).includes(
                                audioSource,
                            )
                        ) {
                            hasAccess = true;
                        } else {
                            const userGroup = groupMemberships[user];

                            if (
                                userGroup === 'admin' ||
                                userGroup === 'superUser'
                            ) {
                                hasAccess = true;
                            }
                        }

                        if (hasAccess && checkLockoutAccess(controller, audioSource)) {
                            obs.local.setMute(audioSource, false);
                        }
                    }

                    break;
                }
            }
        },
    };
};
