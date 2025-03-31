'use strict'

const { sceneAudioSource, customCommandAlias, globalMusicSource, micGroups, userPermissions } = require('../../config/config.js');
const { cleanName } = require('../../utils/helper.js');
const getCurrentScene = require('../utils/getCurrentScene.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs } }) => {
  return {
    name: 'unmutecam',
    enabled: !!obs,
    permission: {
      group: 'mod'
    },
    run: async ({ args }) => {
      const currentScene = getCurrentScene(obs);

      const currentCustomScene = cleanName(database['customcam'][0]) ?? currentScene;
      const currentSceneBase = customCommandAlias[currentCustomScene] ?? currentCustomScene;

      const arg1 = args[1].trim().toLowerCase();
      switch (arg1) {
        case 'all': {
          for (const source in micGroups.livecams) {
            obs.local.setInputVolume(micGroups.livecams[source].name, micGroups.livecams[source].volume);

            obs.local.setMute(micGroups.livecams[source].name, false);
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
            // can't this just be `audioSource in micGroups.livecams`
            if (Object.keys(micGroups.livecams).includes(audioSource)) {
              hasAccess = true;
            } else {
              // TODO check permissions here
            }

            if (hasAccess) {
              obs.local.setMute(audioSource, false);
            }
          }

          break;
        }
      }
    }
  }
};
