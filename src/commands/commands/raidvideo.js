'use strict';

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs, twitch } }) => {
    return {
        name: 'raidvideo',
        enabled: !!obs,
        permission: {
            group: 'operator',
        },
        run: async ({ channel, user }) => {
            await obs.local.setSceneItemEnabled(
                obs.local.currentScene,
                'Raid',
                true,
            );

            setTimeout(() => {
                obs.local.setSceneItemEnabled(
                    obs.local.currentScene,
                    'Raid',
                    'false',
                );
            }, 40000);

            if (channel === 'ptzapi') {
                twitch.send(channel, `${user} started the Raid video`, true);
            }
        },
    };
};
