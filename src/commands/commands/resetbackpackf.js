'use strict'

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs } }) => {
  return {
    name: 'resetbackpackf',
    enabled: !!obs,
    permission: {
      group: 'operator'
    },
    run: () => {
      obs.cloud.restartSource('Maya RTMP 1');
      obs.cloud.restartSource('RTMP Mobile');
      obs.cloud.restartSource('Space RTMP Backpack');
    }
  }
};
