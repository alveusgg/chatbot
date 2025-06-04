'use strict';

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs } }) => {
    return {
        name: 'resetpcf',
        enabled: !!obs,
        permission: {
            group: 'vip',
        },
        run: () => {
            obs.cloud.restartSource('Space RTMP Desktop');
            obs.cloud.restartSource('Maya RTMP 3');
            obs.cloud.restartSource('RTMP AlveusDesktop');
        },
    };
};
