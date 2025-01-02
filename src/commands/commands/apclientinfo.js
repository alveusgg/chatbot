'use strict';

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { twitch, unifi } }) => {
    return {
        name: 'apclientinfo',
        enabled: !!unifi,
        permission: {
            group: 'superUser',
        },
        run: async ({ channel, args }) => {
            const apClient = await unifi.getSignal(args[1]);

            let chatMessage;
            if (apClient) {
                let { signal, ap_name } = apClient;

                if (ap_name.includes(':') || unifi.isValidMacAddress(ap_name)) {
                    ap_name = 'AlveusAP';
                }

                chatMessage = `LiveU Signal ${signal}(${ap_name})`;
            } else {
                chatMessage = `LiveU Not Found`;
            }

            twitch.send(channel, chatMessage);
        },
    };
};
