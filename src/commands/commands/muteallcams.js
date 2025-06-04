'use strict';

const { micGroups, globalMusicSource } = require('../../config/config.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs } }) => {
    return {
        name: 'muteallcams',
        enabled: !!obs,
        permission: {
            group: 'vip',
        },
        run: () => {
            for (const source in micGroups.livecams) {
                obs.local.setMute(micGroups.livecams[source].name, true);
            }

            for (const source in micGroups.restrictedcams) {
                obs.local.setMute(micGroups.restrictedcams[source].name, true);
            }

            obs.cloud.setMute(globalMusicSource, false);
        },
    };
};
