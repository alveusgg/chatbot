'use strict';

const Logger = require('../../utils/logger.js');

const logger = new Logger();

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs } }) => {
    return {
        name: 'showrounds',
        enabled: !!obs,
        permission: {
            group: 'operator',
        },
        run: async () => {
            await obs.local.setSceneItemEnabled(obs.local.currentScene, "roundsweboverlay", true);

			logger.log("Starting Rounds");

            // const hour = new Date().getUTCHours();

            // const sourceName =
            //     hour > 0 && hour < 12 ? 'roundsNightGraphic' : 'roundsGraphic';

            // await obs.local.setSceneItemEnabled(
            //     'RoundsOverlay',
            //     sourceName,
            //     true,
            // );
        },
    };
};
