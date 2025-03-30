'use strict'

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs } }) => {
  return {
    name: 'resetpcf',
    enabled: !!obs,
    permission: {
      group: 'operator'
    },
    run: () => {
			obs.cloud.restartSource("Maya RTMP 3");
			obs.cloud.restartSource("RTMP AlveusDesktop");
			obs.cloud.restartSource("Space RTMP Desktop");
    }
  }
};
