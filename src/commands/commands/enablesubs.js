'use strict';

const Logger = require('../../utils/logger.js');

const logger = new Logger();

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { database } }) => {
    return {
        name: 'enablesubs',
        aliases: ['startsubs', 'unlockcontrols'],
        enabled: !!database,
        permission: {
            group: 'mod'
        },
        run: () => {
            database.enabledSubs = true;
            logger.log('Sub Commands Enabled');
        }
    }
}
