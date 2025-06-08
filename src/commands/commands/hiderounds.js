'use strict';

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs } }) => {
    return {
        name: 'hiderounds',
        enabled: !!obs,
        permission: {
            group: 'operator',
        },
        run: async () => {
            await obs.local.setSceneItemEnabled(obs.local.currentScene, "roundsweboverlay", false);

			// for (const source in config.roundsCommandMapping) {
			//     await controller.connections.obs.local.setSceneItemEnabled("RoundsOverlay", config.roundsCommandMapping[source], false);
			// }
			// await controller.connections.obs.local.setSceneItemEnabled("RoundsOverlay", "roundsGraphic", false);
			// await controller.connections.obs.local.setSceneItemEnabled("RoundsOverlay", "roundsNightGraphic", false);
        },
    };
};
