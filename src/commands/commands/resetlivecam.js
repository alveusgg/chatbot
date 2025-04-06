'use strict';

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs } }) => {
    return {
        name: 'resetlivecam',
        enabled: !!obs,
        permission: {
            group: 'vip',
        },
        run: () => {
            obs.cloud.restartSceneItem(obs.cloud.currentScene, 'Maya RTMP 2');
            obs.cloud.restartSceneItem(
                obs.cloud.currentScene,
                'RTMP AlveusStudio',
            );
            obs.cloud.restartSceneItem(
                obs.cloud.currentScene,
                'Space RTMP Server',
            );
        },
    };
};
