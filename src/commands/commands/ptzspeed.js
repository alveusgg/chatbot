'use strict';

const ptzCommandSetup = require('../utils/ptzCommandSetup.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs, cameras, database, twitch } }) => {
    return {
        name: 'ptzspeed',
        enabled: !!obs && !!cameras && !!database,
        permission: {
            group: 'operator',
        },
        run: async ({ channel, args: _args }) => {
            const { currentScene, camera, args } = ptzCommandSetup(
                obs,
                cameras,
                database,
                _args,
            );

            if (!camera) {
                // Couldn't find the camera
                return;
            }

            if (args[1] !== '') {
                camera.setSpeed(args[1]);
                database[currentScene].speed = args[1];
            } else {
                const camSpeed = await camera.getSpeed();
                twitch.send(channel, `PTZ Speed: ${camSpeed}`);
            }
        },
    };
};
