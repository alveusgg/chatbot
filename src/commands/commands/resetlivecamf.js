'use strict';

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs } }) => {
    return {
        name: 'resetlivecamf',
        enabled: !!obs,
        permission: {
            group: 'vip',
        },
        run: () => {
            obs.cloud.restartSource('Space RTMP Server');
            obs.cloud.restartSource('Maya RTMP 2');
            obs.cloud.restartSource('RTMP AlveusStudio');
        },
    };
};
