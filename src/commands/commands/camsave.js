'use strict';

const Logger = require('../../utils/logger.js');

const logger = new Logger();

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { database } }) => {
    return {
        name: 'camsave',
        enabled: !!database,
        permission: {
            group: 'mod',
        },
        run: ({ args }) => {
            const currentCamList = database['customcam'] ?? [];

            if (currentCamList.length === 0) {
                logger.log('Failed to save layout. No current cam list');
                return;
            }

            const currentUserCommand =
                database['customcamscommand'] ?? 'customcams';
            const arg1 = args[1].trim().toLowerCase();

            const name = arg1 !== '' ? arg1 : 'temporarylayoutsave';

            database['layoutpresets'][name] = {
                list: currentCamList,
                command: currentUserCommand,
            };
        },
    };
};
