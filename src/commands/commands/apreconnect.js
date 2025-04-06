'use strict';

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { twitch, unifi } }) => {
    return {
        name: 'apreconnect',
        enabled: !!unifi,
        permission: {
            group: 'mod',
        },
        run: async ({ channel }) => {
            const response = await unifi.clientReconnect('liveu');

            const message = response
                ? 'Reconnecting LiveU'
                : 'Reconnecting LiveU Failed';

            twitch.send(channel, message);
        },
    };
};
