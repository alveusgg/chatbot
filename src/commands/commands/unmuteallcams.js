'use strict'

const { micGroups, globalMusicSource } = require('../../config/config.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs } }) => {
  return {
    name: 'unmuteallcams',
    enabled: !!obs,
    permission: {
      group: 'mod'
    },
    run: () => {
      for (const source in micGroups.livecams) {
        obs.local.setInputVolume(micGroups.livecams[source].name, micGroups.livecams[source].volume);
        obs.local.setMute(micGroups.livecams[source].name, false);
      }

      obs.cloud.setMute(globalMusicSource, true);
    }
  }
};
