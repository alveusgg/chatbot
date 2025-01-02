'use strict';

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs } }) => {
    return {
        name: 'resetphone',
        enabled: !!obs,
        permission: {
            group: 'vip',
        },
        run: () => {
            obs.cloud.restartSceneItem(
                obs.cloud.currentScene,
                'Space RTMP Phone',
            );
            obs.cloud.restartSceneItem(obs.cloud.currentScene, 'RTMP Mobile');
        },
    };
};
