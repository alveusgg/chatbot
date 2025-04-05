'use strict';

const { restrictedHours, sceneAudioSource } = require('../../config/config.js');
const Logger = require('../../utils/logger.js');

const logger = new Logger('scheduler/tasks/nightcams');

/**
 * @type {import('../types.d.ts').TaskRegister}
 */
module.exports = ({ connections: { twitch, obs } }) => {
  const runHour = restrictedHours.start - 1;
  const runMinute = 55;

  return {
    name: 'nightcams',
    enabled: !!twitch && !!obs,
    runAt: {
      hour: runHour,
      minute: runMinute
    },
    run: async () => {
      logger.info(`Timer (${runHour}:${runMinute}) - Send !nightcams !mute fox`);

      const promises = [
        twitch.send('alveusgg', '!nightcams'),
        obs?.local.setMute(sceneAudioSource['fox'], true)
      ]

      // TODO switch to custom cams

      await Promise.all(promises);
    }
  }
}
