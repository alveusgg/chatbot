'use strict'

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { twitch, unifi } }) => {
  return {
    name: 'apsignal',
    aliases: ['apclientinfo'],
    enabled: !!unifi,
    permission: {
      group: 'operator'
    },
    run: async ({ channel }) => {
      const clientName = args[0] === 'apsignal' ? 'liveu' : args[1];
      const apClient = await unifi.getSignal(clientName);

      let chatMessage;
      if (apClient) {
        const { signal, ap_name } = apClient;

        if (ap_name.includes(':') || unifi.isValidMacAddress(ap_name)) {
          ap_name = 'AlveusAP'
        }

        chatMessage = `LiveU Signal ${signal}(${ap_name})`;
      } else {
        chatMessage = `LiveU Not Found`;
      }

      twitch.send(channel, chatMessage);
    }
  }
};
