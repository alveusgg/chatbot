'use strict';

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs } }) => {
    return {
        name: 'resetpc',
        enabled: !!obs,
        permission: {
            group: 'vip',
        },
        run: () => {
            obs.cloud.restartSceneItem(obs.cloud.currentScene, 'Maya RTMP 3');
            obs.cloud.restartSceneItem(
                obs.cloud.currentScene,
                'RTMP AlveusDesktop',
            );
            obs.cloud.restartSceneItem(
                obs.cloud.currentScene,
                'Space RTMP Desktop',
            );
        },
    };
};
