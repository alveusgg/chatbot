'use strict';

const config = require('../../config/config.js');
const { micGroups, globalMusicSource } = require('../../config/config.js');
const checkLockoutAccess = require('../../utils/checkLockoutAccess.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    const { connections: { obs } } = controller;

    return {
        name: 'muteallcams',
        enabled: !!obs,
        permission: {
            group: 'vip',
        },
        run: () => {
            for (const source in micGroups.livecams) {
                if (checkLockoutAccess(controller, config.micGroups["livecams"][source].name)) {
                    obs.local.setMute(micGroups.livecams[source].name, true);
                }
            }

            for (const source in micGroups.restrictedcams) {
                if (checkLockoutAccess(controller, config.micGroups["restrictedcams"][source].name)) {
                    obs.local.setMute(micGroups.restrictedcams[source].name, true);
                }
            }

            obs.cloud.setMute(globalMusicSource, false);
        },
    };
};
