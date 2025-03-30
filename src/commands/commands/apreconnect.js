'use strict'

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { twitch, unifi } }) => {
  return {
    name: 'apreconnect',
    aliases: ['apclientreconnect'],
    enabled: !!unifi,
    permission: {
      group: 'operator'
    },
    run: async ({ channel, args }) => {
      const clientName = args[0] === 'apreconnect' ? 'liveu' : args[1];

      const response = await unifi.clientReconnect(clientName);
      
      const message = response ? 'Reconnecting LiveU' : 'Reconnecting LiveU Failed';

      twitch.send(channel, message);
    }
  }
};
