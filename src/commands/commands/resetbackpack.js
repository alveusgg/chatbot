'use strict';

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs } }) => {
    return {
        name: 'resetbackpack',
        enabled: !!obs,
        permission: {
            group: 'vip',
        },
        run: () => {
            obs.cloud.restartSceneItem(obs.cloud.currentScene, 'Maya RTMP 1');
            obs.cloud.restartSceneItem(obs.cloud.currentScene, 'RTMP Mobile');
            obs.cloud.restartSceneItem(
                obs.cloud.currentScene,
                'Space RTMP Backpack',
            );
        },
    };
};
