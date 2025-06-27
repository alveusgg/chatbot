'use strict';

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { twitch, unifi } }) => {
    return {
        name: 'apclientreconnect',
        enabled: !!unifi,
        permission: {
            group: 'superUser',
        },
        run: async ({ channel, args }) => {
            const response = await unifi.clientReconnect(args[1]);

            const message = response
                ? 'Reconnecting LiveU'
                : 'Reconnecting LiveU Failed';

            twitch.send(channel, message);
        },
    };
};
