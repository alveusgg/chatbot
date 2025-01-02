'use strict';

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { database } }) => {
    return {
        name: 'camclear',
        enabled: !!database,
        permission: {
            group: 'superUser',
        },
        run: () => {
            database['layoutpresets'] = {};
        },
    };
};
