'use strict';

const { micGroups } = require('../../config/config.js');
const checkLockoutAccess = require('../../utils/checkLockoutAccess.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    const { connections: { obs } } = controller;
    return {
        name: 'resetvolume',
        enabled: !!obs,
        permission: {
            group: 'vip',
        },
        run: async () => {
            for (const source in micGroups.livecams) {
                if (checkLockoutAccess(controller, micGroups.livecams[source].name)) {
                    obs.local.setInputVolume(
                        micGroups.livecams[source].name,
                        micGroups.livecams[source].volume,
                    );
                }
            }
        },
    };
};
