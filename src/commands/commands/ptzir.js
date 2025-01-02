'use strict';

const ptzCommand = require('../utils/ptzCommand.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    return ptzCommand(controller, {
        name: 'ptzir',
        enabled: true,
        permission: {
            group: 'operator',
        },
        throttling: 'ptz',
        run: async ({ channel, user, args, camera, ptzCameraName }) => {
            if (!camera) {
                return;
            }

            switch (args[1]) {
                case '1':
                case 'on':
                case 'yes':
                    camera.setIRCutFilter('off');
                    break;
                case '0':
                case 'off':
                case 'no':
                    camera.setIRCutFilter('on');
                    break;
                default:
                    camera.setIRCutFilter('auto');
            }

            if (channel === 'ptzapi') {
                controller.connections.twitch.send(
                    channel,
                    `${user}: ptzir ${ptzCameraName} ${args[1]}`,
                    true,
                );
            }
        },
    });
};
