'use strict'

const ptzCommandSetup = require('../utils/ptzCommandSetup.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { api, obs, cameras, database, twitch } }) => {
  return {
    name: 'ptzir',
    enabled: !!api && !!obs && !!cameras && !!database,
    permission: {
      group: 'operator'
    },
    run: async ({ channel, user, args: _args }) => {
      const { args, camera, ptzCameraName } = ptzCommandSetup(obs, cameras, database, _args);

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
				twitch.send(channel, `${user}: ptzir ${ptzCameraName} ${args[1]}`, true);
			}
    }
  }
};
