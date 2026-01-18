'use strict';

//updated

const Logger = require('../../utils/logger.js');

const logger = new Logger();

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { database, twitch } }) => {
    return {
        name: 'blockuser',
        aliases: [
            'blacklist',
            'removeuser'
        ],
        enabled: !!database,
        permission: {
            group: 'mod'
        },
        run: ({ args, channel }) => {
            database["blockedUsers"][args[1]] = true;

			twitch.send(channel, `Blocked: ${args[1]}`);
			let blocklist = Object.keys(database["blockedUsers"]);
			logger.log(`Blocked Users (${blocklist.length}): ${blocklist}`);
        }
    }
}
