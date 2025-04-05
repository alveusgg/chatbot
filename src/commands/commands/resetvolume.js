'use strict'

const { micGroups } = require('../../config/config.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs } }) => {
  return {
    name: 'resetvolume',
    enabled: !!obs,
    permission: {
      group: 'vip'
    },
    run: async () => {
      for (const source in micGroups.livecams) {
        obs.local.setInputVolume(micGroups.livecams[source].name, micGroups.livecams[source].volume);
      }
    }
  }
};
