'use strict';

const ptzCommand = require('../utils/ptzCommand.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    return ptzCommand(controller, {
        name: 'ptzseta',
        enabled: true,
        permission: {
            group: 'operator',
        },
        throttling: 'ptz',
        run: async ({ channel, user, args, camera, ptzCameraName }) => {
            if (!camera) {
                return;
            }

            const rpan = args[1];
            const tilt = parseFloat(args[2]);
            const zoom = parseInt(args[3]);
            let autoFocus = args[4];
            const focus = parseInt(args[5]);

            switch (autoFocus) {
                case '1':
                case 'on':
                case 'yes':
                    autoFocus = 'on';
                    break;
                case '0':
                case 'off':
                case 'no':
                    autoFocus = 'off';
                    break;
                default:
                    autoFocus = 'on';
                    break;
            }

            const ptz = {
                rpan,
                tilt: !isNaN(tilt) ? tilt : undefined,
                zoom: !isNaN(zoom) ? zoom : undefined,
                autofocus: autoFocus,
                focus: !isNaN(focus) ? focus : undefined,
            };

            await camera.ptz(ptz);

            if (channel === 'ptzapi') {
                controller.connections.twitch.send(channel, `${user}: ptzseta ${ptzCameraName}`, true);
            }
        },
    });
};
