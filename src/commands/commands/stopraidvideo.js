'use strict';

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs } }) => {
    return {
        name: 'stopraidvideo',
        enabled: !!obs,
        permission: {
            group: 'operator',
        },
        run: async () => {
            await obs.local.setSceneItemEnabled(
                obs.local.currentScene,
                'Raid',
                'false',
            );
        },
    };
};
