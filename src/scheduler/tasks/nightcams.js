'use strict';

const { restrictedHours, sceneAudioSource, customCamCommandMapping } = require('../../config/config.js');
const Logger = require('../../utils/logger.js');
const switchToCustomCams = require('../../utils/switchToCustomCams.js');

const logger = new Logger();

/**
 * @type {import('../types.d.ts').TaskRegister}
 */
module.exports = ({ connections }) => {
    const { twitch, obs } = connections;

    const runHour = restrictedHours.start - 1;
    const runMinute = 55;

    return {
        name: 'nightcams',
        enabled: false,
        // enabled: !!twitch && !!obs,
        runAt: {
            hour: runHour,
            minute: runMinute,
        },
        run: async () => {
            logger.info(
                `Timer (${runHour}:${runMinute}) - Send !nightcams !mute fox`,
            );

            const promises = [
                twitch.send('alveusgg', '!nightcams'),
                obs?.local.setMute(sceneAudioSource['fox'], true),
            ];

            switchToCustomCams(
                connections,
                'alveusgg',
                'admin',
                'customcamsbig',
                customCamCommandMapping['nightcams']
            );

            await Promise.all(promises);
        },
    };
};
