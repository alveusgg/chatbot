'use strict';

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs } }) => {
    return {
        name: 'showchat',
        aliases: ['hidechat'],
        enabled: !!obs,
        permission: {
            group: 'operator',
        },
        run: async ({ args }) => {
            const value = args[0] === 'showchat' ? true : false;

            await obs.local.setSceneItemEnabled(
                obs.local.currentScene,
                'Alveus Chat Overlay',
                value,
            );

            await obs.cloud.setSceneItemEnabled(
                obs.local.currentScene,
                'Alveus Chat Overlay',
                value,
            );
        },
    };
};
