'use strict';

const { groupMemberships } = require('../../config/config.js');
const switchToCustomCam = require('../../utils/switchToCustomCams.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    const {
        connections: { database },
    } = controller;

    return {
        name: 'camload',
        enabled: !!database,
        permission: {
            group: 'mod',
        },
        run: ({ channel, user, args }) => {
            const arg1 = args[1].trim().toLowerCase();
            const preset = database['layoutpresets']?.[arg1] ?? null;
            const userGroup = groupMemberships[user];

            if (preset != null && preset.list && preset.command) {
                const chatMessage = preset.list.join(' ');

                switchToCustomCam(
                    controller,
                    channel,
                    userGroup,
                    preset.command,
                    chatMessage,
                );
            } else if (arg1 === '') {
                const previous =
                    database['layoutpresets']['temporarylayoutsave'] ?? {};

                if (previous !== null && previous.list && previous.command) {
                    const chatMessage = previous.list.join(' ');

                    switchToCustomCam(
                        controller,
                        channel,
                        userGroup,
                        preset.command,
                        chatMessage,
                    );
                }
            }
        },
    };
};
