'use strict'

const { roundsCommandMapping } = require('../../config/config.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs } }) => {
  return {
    name: 'hiderounds',
    enabled: !!obs,
    permission: {
      group: 'operator'
    },
    run: async () => {
      for (const source in roundsCommandMapping) {
        await obs.local.setSceneItemEnabled('RoundsOverlay', roundsCommandMapping[source], false);
      }

      await obs.local.setSceneItemEnabled('RoundsOverlay', 'roundsNightGraphic', true);
      await obs.local.setSceneItemEnabled('RoundsOverlay', 'roundsGraphic', true);
    }
  }
}