'use strict';

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs } }) => {
    return {
        name: 'resetcloudsource',
        enabled: !!obs,
        permission: {
            group: 'superUser',
        },
        run: ({ args }) => {
            obs.cloud.restartSceneItem(obs.cloud.currentScene, args.slice(1));
        },
    };
};
