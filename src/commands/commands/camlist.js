'use strict';

//updated

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { database, twitch } }) => {
    return {
        name: 'camlist',
        enabled: !!database,
        permission: {
            group: 'mod',
        },
        run: ({ channel }) => {
            const cameras = Object.keys(database['layoutpresets']).toString();

            twitch.send(channel, `Cam Layout Presets: ${cameras}`);
        },
    };
};
