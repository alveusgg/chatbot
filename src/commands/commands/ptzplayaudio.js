'use strict';

/**
 * @type {Record<string, number>}
 */
const audioNameToIdMap = {
    alarm: 37,
    siren: 49,
    emergency: 40,
    trespassing: 43,
    camera: 33,
    hello: 1,
    despacito: 0,
    ringtone: 35,
    dog: 44,
};

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
    return {
        name: 'ptzplayaudio',
        aliases: ['playclip', 'playaudio'],
        enabled: controller.connections.cameras !== undefined,
        permission: {
            group: 'operator',
        },
        throttling: 'ptz',
        run: async ({ args }) => {
            const speaker = controller.connections.cameras.speaker;

            const [, audioName] = args;

            // Defaults to alarm
            let audioId = 37;
            if (audioName) {
                if (audioName in audioNameToIdMap) {
                    audioId = audioNameToIdMap[audioName];
                } else if (audioName !== '') {
                    audioId = audioName;
                }
            }

            await speaker.playAudioClip(audioId);
        },
    };
};
