'use strict'

const Logger = require('../../utils/logger.js');
const ptzCommandSetup = require('../utils/ptzCommandSetup.js');

const logger = new Logger('src/commands/commands/ptzgetinfo');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { api, obs, cameras, database, twitch } }) => {
  return {
    name: 'ptzgetinfo',
    enabled: !!api && !!obs && !!cameras && !!database,
    permission: {
      group: 'operator'
    },
    run: async ({ channel, args: _args }) => {
      const { camera, currentScene } = ptzCommandSetup(obs, cameras, database, _args);
      const position = await camera.getPosition();

      if (!position || position.pan !== null) {
        logger.log('Failed to get ptz position');
        return;
      }

      if (channel === 'ptzapi') {
        api.sendAPI(`PTZ Info (${currentScene}): ${position.pan}p |${position.tilt}t |${position.zoom}z |af ${position.autofocus || "n/a"} |${position.focus || "n/a"}f`);
      } else {
        twitch.send(channel, `PTZ Info (${currentScene}): ${position.pan}p |${position.tilt}t |${position.zoom}z |af ${position.autofocus || "n/a"} |${position.focus || "n/a"}f`);
      }
    }
  }
};
