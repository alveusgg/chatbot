'use strict';

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs } }) => {
    return {
        name: 'resetcloudsourcef',
        enabled: !!obs,
        permission: {
            group: 'superUser',
        },
        run: ({ args }) => {
            obs.cloud.restartSource(args.splice(1));
        },
    };
};
