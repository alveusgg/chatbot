'use strict'

const ptzCommandSetup = require('../utils/ptzCommandSetup.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { api, obs, cameras, database, twitch } }) => {
  return {
    name: 'ptzirlight',
    enabled: !!api && !!obs && !!cameras && !!database,
    permission: {
      group: 'mod'
    },
    run: async ({ args: _args }) => {
      const { args, camera, ptzCameraName } = ptzCommandSetup(obs, cameras, database, _args);

      switch (args[1]) {
        case '1':
        case 'on':
        case 'yes':
          camera.enableIR();
          break;
        default:
          camera.disableIR();
          break;
      }

			if (channel === 'ptzapi') {
				twitch.send(channel, `${user}: ptzir ${ptzCameraName} ${args[1]}`, true);
			}
    }
  }
};
