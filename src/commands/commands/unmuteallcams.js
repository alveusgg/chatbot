'use strict';

const { micGroups, globalMusicSource } = require('../../config/config.js');
const checkLockoutAccess = require('../../utils/checkLockoutAccess.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    const { connections: { obs } } = controller;
    return {
        name: 'unmuteallcams',
        enabled: !!obs,
        permission: {
            group: 'mod',
        },
        run: () => {
            for (const source in micGroups.livecams) {
                if (!checkLockoutAccess(controller, micGroups['livecams'][source].name)) {
                    continue;
                }

                obs.local.setInputVolume(
                    micGroups.livecams[source].name,
                    micGroups.livecams[source].volume,
                );
                obs.local.setMute(micGroups.livecams[source].name, false);
            }

            obs.cloud.setMute(globalMusicSource, true);
        },
    };
};
