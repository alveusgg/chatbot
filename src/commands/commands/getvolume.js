'use strict'

const { micGroups, sceneAudioSource, customCommandAlias } = require('../../config/config.js');
const { cleanName } = require('../../utils/helper.js');
const Logger = require('../../utils/logger.js');
const getCurrentScene = require('../utils/getCurrentScene.js');

const logger = new Logger();

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { api, database, obs, twitch } }) => {
  return {
    name: 'getvolume',
    enabled: !!database && !!obs,
    permission: {
      group: 'vip'
    },
    run: async ({ channel, args }) => {
      const cameraName = args[1].trim().toLowerCase();
      const cleanedArg1 = cleanName(args[1]);

      if (cameraName === '' || cameraName === 'all') {
        let output = '';

        for (const group of ['livecams', 'restrictedcams']) {
          for (const source of micGroups.livecams) {
            let dbVolume = obs.local.getInputVolume(micGroups[group][source.name]);
            dbVolume = Number(dbVolume);
  
            if (!isNaN(dbVolume)) {
              const correctedVol = 100 + dbVolume;
              const isMuted = await obs.local.getMute(micGroups[group][source].name);
  
              const muteStatus = isMuted ? 'm' : '';
  
              output += `${source} - ${correctedVol.toFixed(1).replace(/[.,]0$/, "")}${muteStatus}, `;
            }
          }
        }

        let dbVolume = await obs.cloud.getInputVolume('Music Playlist Global');
        dbVolume = Number(dbVolume);

        if (!isNaN(dbVolume)) {
          const correctedVol = 100 + dbVolume;
          const isMuted = await obs.local.getMute(micGroups[group][source].name);

          const muteStatus = isMuted ? 'm' : '';

          output += `${source} - ${correctedVol.toFixed(1).replace(/[.,]0$/, "")}${muteStatus}, `;
        }

        if (channel === 'ptzapi') {
          api.sendAPI(`Volumes: ${output}`);
        } else {
          twitch.send(channel, `Volumes: ${output}`);
        }
      } else {
        let volumeName = cleanedArg1;
        
        let audioSource;
        if (cameraName === 'mic' || cameraName === 'mics' || cameraName === 'cam' || cameraName === 'cams') {
          const currentScene = getCurrentScene(obs);

          const currentCustomScene = cleanName(database['customcam'][0]) ?? currentScene;
          const currentSceneBase = customCommandAlias[currentCustomScene] ?? currentCustomScene;

          audioSource = sceneAudioSource[currentSceneBase];
          volumeName = currentSceneBase;
        } else {
          audioSource = sceneAudioSource[cleanedArg1];

          if (audioSource === null || audioSource === '') {
            audioSource = cameraName;
          }
        }

        if (cameraName === 'music') {
          // get music
          let dbVolume = await obs.cloud.getInputVolume("Music Playlist Global");
					dbVolume = parseInt(dbVolume);
					if (!isNaN(dbVolume)) {
						const correctedVol = 100 + dbVolume;

						const isMuted = await obs.cloud.getMute("Music Playlist Global");
						const muteStatus = isMuted ? "m" : '';

            if (channel === 'ptzapi') {
							api.sendAPI(channel, `Music Volume: ${correctedVol.toFixed(1).replace(/[.,]0$/, "")}${muteStatus}`)
						} else {
							twitch.send(channel, `Music Volume: ${correctedVol.toFixed(1).replace(/[.,]0$/, "")}${muteStatus}`)
						}
					}
        } else {
          let dbVolume = await obs.local.getInputVolume(audioSource);
					dbVolume = parseInt(dbVolume);
					if (!isNaN(dbVolume)) {
						let correctedVol = 100 + dbVolume;
						let isMuted = await obs.local.getMute(audioSource);
						logger.log("getvolume", audioSource, isMuted);
						let muteStatus = "";
						if (isMuted) {
							muteStatus = "m";
						}
						// logger.log("Setting",correctedVol);
						if (channel === 'ptzapi') {
							api.sendAPI(channel, `Volume: ${volName} - ${correctedVol.toFixed(1).replace(/[.,]0$/, "")}${muteStatus}`)
						} else {
							twitch.send(channel, `Volume: ${volName} - ${correctedVol.toFixed(1).replace(/[.,]0$/, "")}${muteStatus}`)
						}
					}
        }
      }
    }
  }
};
