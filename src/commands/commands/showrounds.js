'use strict';

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
            const hour = new Date().getUTCHours();

            const sourceName =
                hour > 0 && hour < 12 ? 'roundsNightGraphic' : 'roundsGraphic';

            await obs.local.setSceneItemEnabled(
                'RoundsOverlay',
                sourceName,
                true,
            );
        },
    };
};
