'use strict';

const findBox = require('../utils/findBox.js');
const ptzCommand = require('../utils/ptzCommand.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    return ptzCommand(controller, {
        name: 'ptzgetcam',
        enabled: true,
        permission: {
            group: 'user',
        },
        throttling: 'ptz',
        checkPtzLockout: false,
        run: async ({ channel, args }) => {
            const x = Number(args[1]);
            const y = Number(args[2]);

            if (isNaN(x) || isNaN(y)) {
                return;
            }

            const camera = findBox(controller.connections.database, x, y);

            let output;
            if (args[3] === 'json') {
                output = JSON.stringify({
                    cam: camera.ptzCameraName,
                    position: camera.zone + 1,
                });
            } else {
                output = camera.ptzCameraName;
            }

            controller.connections.twitch.send(channel, output);
        },
    });
};
