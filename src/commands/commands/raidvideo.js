'use strict'

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs } }) => {
  return {
    name: 'raidvideo',
    enabled: !!obs,
    permission: {
      group: 'operator'
    },
    run: async () => {
      await obs.local.setSceneItemEnabled(obs.local.currentScene, 'Raid', true);

      setTimeout(() => {
        obs.local.setSceneItemEnabled(obs.local.currentScene, 'Raid', 'false')
      }, 40000);
    }
  }
};
