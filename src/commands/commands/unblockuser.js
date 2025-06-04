// @ts-check
'use strict';

const Logger = require('../../utils/logger.js');

const logger = new Logger();

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { database, twitch } }) => {
    return {
        name: 'unblockuser',
        enabled: !!database,
        permission: {
            // TODO
            group: 'mod'
        },
        run: ({ args, channel }) => {
            if (database["blockedUsers"][args[1]]){
				delete database["blockedUsers"][args[1]];
				twitch.send(channel, `Unblocked: ${args[1]}`);
				let blocklist2 = Object.keys(database["blockedUsers"]);
				logger.log(`Blocked Users (${blocklist2.length}): ${blocklist2}`);
			}
        }
    }
}
