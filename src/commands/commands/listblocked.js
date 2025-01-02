'use strict';

const Logger = require('../../utils/logger.js');

const logger = new Logger();

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { database } }) => {
    return {
        name: 'listblocked',
        aliases: ['listblock', 'listbanned', 'blockedlist', 'blocklist'],
        enabled: !!database,
        permission: {
            group: 'mod'
        },
        run: () => {
            let blocklist3 = Object.keys(database["blockedUsers"]);
			logger.log(`Blocked Users (${blocklist3.length}): ${blocklist3}`);
        }
    }
}
