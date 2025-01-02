'use strict';

const {
    sceneAudioSource,
    customCommandAlias,
} = require('../../config/config.js');
const checkLockoutAccess = require('../../utils/checkLockoutAccess.js');
const { cleanName } = require('../../utils/helper.js');
const getCurrentScene = require('../utils/getCurrentScene.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    const { connections: { database, obs } } = controller;

    return {
        name: 'setmute',
        enabled: !!obs && !!database,
        permission: {
            group: 'superUser',
        },
        run: async ({ args }) => {
            let muteStatus;

            switch (args[2].trim().toLowerCase()) {
                case '1':
                case 'on':
                case 'yes':
                    muteStatus = true;
                    break;
                case '0':
                case 'off':
                case 'no':
                    muteStatus = false;
                    break;
                default:
                    muteStatus = args[2].trim();
                    break;
            }

            const currentScene = await getCurrentScene(obs);

            const currentCustomScene =
                cleanName(database['customcam'][0]) ?? currentScene;
            const currentSceneBase =
                customCommandAlias[currentCustomScene] ?? currentCustomScene;

            let audioSource;
            if (args[1] === '' || args[1] === 'mic') {
                audioSource = sceneAudioSource[currentSceneBase];
            } else {
                let arg1Base = customCommandAlias[args[1]];
                if (!arg1Base) {
                    arg1Base = cleanName(args[1]) ?? '';
                }

                audioSource = sceneAudioSource[arg1Base];
            }

            if (!audioSource || audioSource === '') {
                audioSource = args[1];
            }

            if (checkLockoutAccess(controller, audioSource)) {
                obs.local.setMute(audioSource, muteStatus);
            }
        },
    };
};
