'use strict'

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs } }) => {
  return {
    name: 'resetextra',
    enabled: !!obs,
    permission: {
      group: 'operator'
    },
    run: () => {
			obs.cloud.restartSceneItem(obs.cloud.currentScene, "Space RTMP Extra");
    }
  }
};
