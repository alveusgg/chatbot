'use strict';

//updated

const Logger = require('../../utils/logger.js');

const logger = new Logger();

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { database } }) => {
    return {
        name: 'campresetremove',
        enabled: !!database,
        permission: {
            group: 'mod',
        },
        run: ({ args }) => {
            const arg1 = args[1].trim().toLowerCase();
            const preset = database['layoutpresets']?.[arg1];

            if (!preset) {
                return;
            }

            const response = delete database['layoutpresets'][arg1];

            if (response !== true) {
                logger.level(
                    `Failed to remove the cam preset ${arg1}: ${response} ${database['layoutpresets']}`,
                );
            }
        },
    };
};
