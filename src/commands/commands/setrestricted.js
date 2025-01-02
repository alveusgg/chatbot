'use strict';

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { database } }) => {
    return {
        name: 'setrestricted',
        enabled: !!database,
        permission: {
            group: 'operator',
        },
        run: ({ args }) => {
            switch (args[1]) {
                case 'off':
                case '0':
                case 'no':
                    database.timeRestrictionDisabled = true;
                    break;
                case '1':
                case 'on':
                case 'yes':
                default:
                    database.timeRestrictionDisabled = false;
                    break;
            }
        },
    };
};
