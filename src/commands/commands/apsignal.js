'use strict';

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { twitch, unifi } }) => {
    return {
        name: 'apsignal',
        enabled: !!unifi,
        permission: {
            group: 'mod',
        },
        run: async ({ channel }) => {
            const apClient = await unifi.getSignal('liveu');

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

            await twitch.send(channel, chatMessage);
        },
    };
};
