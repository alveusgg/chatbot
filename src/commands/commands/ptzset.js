'use strict'

const ptzCommandSetup = require('../utils/ptzCommandSetup.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs, cameras, database, twitch } }) => {
  return {
    name: 'ptzset',
    enabled: !!obs && !!cameras && !!database,
    permission: {
      group: 'operator'
    },
    run: async ({ channel, user, args: _args }) => {
      const { args, camera, ptzCameraName } = ptzCommandSetup(obs, cameras, database, _args);
      const [rpan, rtilt, rzoom] = args;

      await camera.ptz({ rpan: rpan, rtilt, rzoom: rzoom * 100, autofocus: 'on' });

      if (channel === 'ptzapi') {
        twitch.send(channel, `${user}: ptzset ${ptzCameraName}`, true);
      }
    }
  }
};
