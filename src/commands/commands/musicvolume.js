'use strict';

const { globalMusicSource } = require('../../config/config.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs } }) => {
    return {
        name: 'musicvolume',
        enabled: !!obs,
        permission: {
            group: 'vip',
        },
        run: async ({ args }) => {
            const amount = parseInt(args[1]) || 0;
            const scaledVol = 0 - (100 - amount);

            obs.local.setInputVolume(globalMusicSource, scaledVol);
            obs.cloud.setInputVolume(globalMusicSource, scaledVol);
        },
    };
};
