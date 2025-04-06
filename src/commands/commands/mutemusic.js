'use strict';

const { globalMusicSource } = require('../../config/config.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs } }) => {
    return {
        name: 'mutemusic',
        aliases: ['unmutemusic'],
        enabled: !!obs,
        permission: {
            group: 'vip',
        },
        run: async ({ args }) => {
            const value = args[0] === 'mutemusic' ? true : false;

            obs.cloud.setMute(globalMusicSource, value);
        },
    };
};
