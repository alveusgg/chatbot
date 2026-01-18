'use strict';

//updated

const config = require('../../config/config.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { twitch } }) => {
    return {
        name: 'axislist',
        aliases: ['axiscamlist'],
        enabled: true,
        permission: {
            group: 'user'
        },
        run: ({ channel }) => {
            let output2 = "";

			for (let cam of config.axisCameras){
				output2 += `${cam}, `
			}

			twitch.send(channel, `Axis Cams: ${output2}`);
        }
    }
}
