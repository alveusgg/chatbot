'use strict';

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { cameras } }) => {
    return {
        name: 'ptzstopaudio',
        aliases: ['stopclip', 'stopaudio'],
        enabled: cameras !== undefined,
        permission: {
            group: 'operator',
        },
        throttling: 'ptz',
        run: async () => {
            const speaker = cameras.speaker;

            await speaker.stopAudioClip();
        },
    };
};
