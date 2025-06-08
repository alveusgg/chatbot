'use strict';

const ptzCommand = require('../utils/ptzCommand.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    return ptzCommand(controller, {
        name: 'ptzset',
        enabled: true,
        permission: {
            group: 'operator',
        },
        throttling: 'ptz',
        run: async ({ channel, user, args, camera, ptzCameraName}) => {
            const [rpan, rtilt, rzoom] = args;

            if (!camera) {
                return;
            }

            await camera.ptz({
                rpan: rpan,
                rtilt,
                rzoom: rzoom * 100,
                autofocus: 'on',
            });

            if (channel === 'ptzapi') {
                controller.connections.twitch.send(channel, `${user}: ptzset ${ptzCameraName}`, true);
            }
        },
    });
};
