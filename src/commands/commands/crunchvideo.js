'use strict';

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
        run: async ({ channel, user }) => {
            await obs.local.setSceneItemEnabled("fullcam pushpopcrunch", "crunchCamVideo", true);
			setTimeout(()=> obs.local.setSceneItemEnabled("fullcam pushpopcrunch", "crunchCamVideo", false),15000)

			if (channel === 'ptzapi') {
				twitch.send(channel, `${user} started the CrunchCam video`, true);
			}
        }
    }
}
