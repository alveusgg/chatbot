'use strict';

const { globalMusicSource } = require('../../config/config.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs } }) => {
    return {
        name: 'musicprevious',
        enabled: !!obs,
        permission: {
            group: 'vip',
        },
        run: async () => {
            obs.local.prevMediaSource(globalMusicSource);
            obs.cloud.prevMediaSource(globalMusicSource);
        },
    };
};
