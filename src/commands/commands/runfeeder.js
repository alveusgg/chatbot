'use strict';

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { feeder, twitch } }) => {
    return {
        name: 'runfeeder',
        aliases: [
            'runfeed',
            'feedwinnie'
        ],
        enabled: !!feeder,
        permission: {
            group: 'mod'
        },
        run: async ({ channel }) => {
            let feedresp = await feeder.feed();
            let firstpart = feedresp.split("Current Tank") || [feedresp];
			twitch.send(channel, `${firstpart[0]}`);
        }
    }
}
