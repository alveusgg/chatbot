'use strict';

const Logger = require('../../utils/logger.js');

const logger = new Logger();

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs, database, twitch } }) => {
    return {
        name: 'changeserver',
        enabled: !!obs && !!database,
        permission: {
            group: 'superUser',
        },
        run: async ({ channel, args }) => {
            const arg1 = args[1].trim().toLowerCase();
            logger.log(`changing server to:`, arg1);

            let invalid = false;
            switch (arg1) {
                case 'maya': {
                    await obs.cloud.disconnect();
                    obs.cloud = await obs.create('cloudMaya');
                    break;
                }
                case 'alveus': {
                    await obs.cloud.disconnect();
                    obs.cloud = await obs.create('cloudAlveus');
                    break;
                }
                case 'space': {
                    await obs.cloud.disconnect();
                    obs.cloud = await obs.create('cloudSpace');
                    break;
                }
                default: {
                    invalid = true;
                    break;
                }
            }

            setTimeout(async () => {
                const cloudLive = (await obs.cloud.isLive()) || false;
                const serverName = obs.cloud.name;

                logger.log(
                    'Change Server Status:',
                    serverName,
                    cloudLive,
                    obs.cloud.name,
                );

                const message = cloudLive
                    ? `Cloud Server changed to ${serverName}`
                    : `Cloud Server-${serverName} offline`;

                await twitch.send(channel, message);
            }, 5000);

            if (invalid) {
                database.cloudServer = arg1;
            }
        },
    };
};
