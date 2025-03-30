'use strict'

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs } }) => {
  return {
    name: 'resetphonef',
    enabled: !!obs,
    permission: {
      group: 'operator'
    },
    run: () => {
			obs.cloud.restartSource("RTMP Mobile");
    }
  }
};
