'use strict';

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { feeder, twitch } }) => {
    return {
        name: 'runfeeder',
        enabled: !!feeder,
        permission: {
            group: 'mod'
        },
        run: ({ channel }) => {
            let feedresp = await feeder.feed();
			twitch.send(channel, `Feeder: ${feedresp}`);
        }
    }
}
