'use strict';

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs, database } }) => {
    return {
        name: 'setalveusscene',
        aliases: ['setcloudscene'],
        enabled: !!obs && !!database,
        permission: {
            group: 'superUser',
        },
        run: async ({ args: _args }) => {
            const [command, args] = _args;

            const source = command === 'setalveusscene' ? obs.local : obs.cloud;
            await source.setScene(args);

            database['customcam'] = [];
        },
    };
};
