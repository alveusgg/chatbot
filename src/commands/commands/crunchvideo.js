// @ts-check
'use strict';

const config = require('../../config/config.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs, twitch } }) => {
    return {
        name: 'crunchvideo',
        enabled: !!obs,
        permission: {
            // TODO
            group: 'mod'
        },
        run: ({ channel }) => {
            await obs.local.setSceneItemEnabled("fullcam pushpopcrunch", "crunchCamVideo", true);
			setTimeout(()=> obs.local.setSceneItemEnabled("fullcam pushpopcrunch", "crunchCamVideo", false),15000)

			if (channel === 'ptzapi') {
				twitch.send(channel, `${user} started the CrunchCam video`, true);
			}
        }
    }
}
