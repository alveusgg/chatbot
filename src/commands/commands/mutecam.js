'use strict'

const { sceneAudioSource, customCommandAlias, globalMusicSource } = require('../../config/config.js');
const { cleanName } = require('../../utils/helper.js');
const getCurrentScene = require('../utils/getCurrentScene.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs } }) => {
  return {
    name: 'mutecam',
    enabled: !!obs,
    permission: {
      group: 'vip'
    },
    run: async ({ args }) => {
      const currentScene = getCurrentScene(obs);

      const currentCustomScene = cleanName(database['customcam'][0]) ?? currentScene;
      const currentSceneBase = customCommandAlias[currentCustomScene] ?? currentCustomScene;

      switch (args[1].trim().toLowerCase()) {
        case '':
        case 'mic': {
          const audioSource = sceneAudioSource[currentSceneBase];
          obs.local.setMute(audioSource, true);
          break;
        }
        case 'all': {
          for (const source in micGroups.livecams) {
            obs.local.setMute(micGroups.livecams[source].name, true);
          }
    
          for (const source in micGroups.restrictedcams) {
            obs.local.setMute(micGroups.restrictedcams[source].name, true);
          }
    
          obs.cloud.setMute(globalMusicSource, false);

          break;
        }
        case 'music': {
          obs.cloud.setMute(globalMusicSource, true);
          break;
        }
        default: {
          let arg1Base = customCommandAlias[args[1]];
          if (!arg1Base) {
            arg1Base = cleanName(args[1]) ?? '';
          }

          const audioSource = sceneAudioSource[arg1Base];

          if (audioSource === null || audioSource === '') {
            audioSource = args[1];
          }

          obs.local.setMute(audioSource, true);
          break;
        }
      }
    }
  }
};
