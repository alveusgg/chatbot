'use strict';

const Logger = require('../../utils/logger.js');

const logger = new Logger();

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { database } }) => {
    return {
        name: 'disablesubs',
        aliases: ['stopsubs', 'lockcontrols'],
        enabled: !!database,
        permission: {
            group: 'mod'
        },
        run: () => {
            database.enabledSubs = false;
            logger.log('Sub Commands Disabled');
        }
    }
}
