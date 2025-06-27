'use strict';

const {
    roundsCommandMapping,
    customCommandAlias,
} = require('../../config/config.js');
const { cleanName } = require('../../utils/helper.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs } }) => {
    return {
        name: 'clearcheckmarks',
        enabled: !!obs,
        permission: {
            group: 'operator',
        },
        run: async ({ args }) => {
            let checkmarkStatus;
            switch (args[2]) {
                case '1':
                case 'on':
                case 'yes':
                case 'done':
                    checkmarkStatus = true;
                    break;
                case '0':
                case 'off':
                case 'no':
                default:
                    checkmarkStatus = false;
                    break;
            }

            const arg1Clean = cleanName(args[1]);
            const arg1Base = customCommandAlias[arg1Clean] ?? arg1Clean;
            if (arg1Base in roundsCommandMapping) {
                await obs.local.setSceneItemEnabled(
                    'RoundsOverlay',
                    roundsCommandMapping[arg1Base],
                    checkmarkStatus,
                );
            } else {
                for (const source in roundsCommandMapping) {
                    await obs.local.setSceneItemEnabled(
                        'RoundsOverlay',
                        roundsCommandMapping[source],
                        checkmarkStatus,
                    );
                }
            }
        },
    };
};
