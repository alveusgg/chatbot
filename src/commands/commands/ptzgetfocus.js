'use strict';

const ptzCommand = require('../utils/ptzCommand.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    return ptzCommand(controller, {
        name: 'ptzgetfocus',
        enabled: true,
        permission: {
            group: 'vip',
        },
        throttling: 'ptz',
        checkPtzLockout: false,
        run: async ({ channel, camera }) => {
            if (!camera) {
                return;
            }

            const position = await camera.getPosition();
            if (!position) {
                return;
            }

            const focus = parseFloat(position.focus);
            if (!isNaN(focus)) {
                await controller.connections.twitch.send(channel, `PTZ focus (1-9999): ${focus} |af ${position.autofocus || "n/a"}`);
            }
        },
    });
};
