'use strict';

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs } }) => {
    return {
        name: 'resetsourcef',
        enabled: !!obs,
        permission: {
            group: 'mod',
        },
        run: ({ args }) => {
            obs.local.restartSource(args);
        },
    };
};
