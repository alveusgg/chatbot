'use strict';

const { groupMemberships } = require('../../config/config.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { api, obs } }) => {
    return {
        name: 'apigetperms',
        enabled: !!api && !!obs,
        permission: {
            group: 'vip',
        },
        run: async ({ channel, user }) => {
            if (channel !== 'ptzapi') {
                return;
            }

            const group = groupMemberships[user];
            if (!group) {
                return;
            }

            api.sendAPI(`${user} has ${group} permissions`);
        },
    };
};
