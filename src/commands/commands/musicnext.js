'use strict';

const { globalMusicSource } = require('../../config/config.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs } }) => {
    return {
        name: 'musicnext',
        enabled: !!obs,
        permission: {
            group: 'vip',
        },
        run: async () => {
            obs.local.nextMediaSource(globalMusicSource);
            obs.cloud.nextMediaSource(globalMusicSource);
        },
    };
};
