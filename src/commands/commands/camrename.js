'use strict';

//updated

const Logger = require('../../utils/logger.js');

const logger = new Logger();

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { database } }) => {
    return {
        name: 'camrename',
        enabled: !!database,
        permission: {
            group: 'mod',
        },
        run: ({ args }) => {
            const arg1 = args[1].trim().toLowerCase();
            const arg2 = args[2].trim().toLowerCase();

            const preset = database['layoutpresets']?.[arg1];
            if (!preset) {
                return;
            }

            database['layoutpresets'][arg2] = preset;

            const response = delete database['layoutpresets'][arg1];

            if (response !== true) {
                logger.level(
                    `Failed to rename cam preset ${arg1}, ${arg2}: ${response} ${database['layoutpresets']}`,
                );
            }
        },
    };
};
