'use strict';

const { globalMusicSource } = require('../../config/config.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs } }) => {
    return {
        name: 'mutemusiclocal',
        aliases: ['unmutemusiclocal'],
        enabled: !!obs,
        permission: {
            group: 'vip',
        },
        run: async ({ args }) => {
            const value = args[0] === 'mutemusiclocal' ? true : false;

            obs.local.setMute(globalMusicSource, value);
        },
    };
};
