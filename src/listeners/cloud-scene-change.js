'use strict';

const {
    pauseTwitchMarker,
    alveusTwitchID,
    announceChatSceneChange,
} = require('../config/config.js');
const Logger = require('../utils/logger.js');

const logger = new Logger();

/**
 * @param {import('../controller.js')} controller
 * @param {string} name
 * @param {string} oldName
 */
module.exports = async (controller, name, oldName) => {
    logger.log(`Cloud Scene Change from ${oldName} to ${name}`);

    //do nothing if not live, cloud server not live, in studio mode, cloud server not on Alveus Server
    let processChange = false;
    let cloudLive = (await controller.connections.obs.cloud.isLive()) || false;
    if (cloudLive) {
        let cloudStudioMode =
            (await controller.connections.obs.cloud.isStudioMode()) || false;
        if (!cloudStudioMode) {
            if (name != 'Alveus Server') {
                processChange = true;
            }
        }
    }

    if (!processChange) {
        //do nothing
        return;
    }

    if (!pauseTwitchMarker) {
        const markerCams = ['RTMP_Source', 'Maya LiveU', 'Alveus PC'];

        let marker;
        if (markerCams.includes(name)) {
            //new swap
            marker = await controller.connections.twitch.createMarker(
                alveusTwitchID,
                `Livecam Switched to ${name}`,
            );
        } else if (markerCams.includes(oldName)) {
            //ending swap
            marker = await controller.connections.twitch.createMarker(
                alveusTwitchID,
                `Livecam Switched to ${name}`,
            );
        }

        logger.log(
            'Marker Created: ',
            marker.creationDate,
            marker.description,
            marker.id,
            marker.positionInSeconds,
        );
    }

    //Announce Alveus Server Changes to Twitch Chat
    if (announceChatSceneChange) {
        const message = `Cloud Scene Changed to ${name}`;

        controller.connections.twitch.send('alveussanctuary', message);
    }
};
