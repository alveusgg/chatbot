'use strict';

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs } }) => {
    return {
        name: 'resetsource',
        enabled: !!obs,
        permission: {
            group: 'mod',
        },
        run: ({ args }) => {
            obs.local.restartSceneItem(obs.local.currentScene, args.slice(1));
        },
    };
};
