'use strict';

const {
    pauseNotify,
    notifyHours,
    onewayNotifications,
    multiScenes,
    notifyScenes,
    pauseGameChange,
    alveusTwitchID,
    pauseTwitchMarker,
    announceChatSceneChange,
} = require('../config/config.js');
const { cleanName } = require('../utils/helper.js');
const Logger = require('../utils/logger.js');

const logger = new Logger();

/**
 * @param {import('../controller.js')} controller
 * @param {string} name
 * @param {string} oldName
 */
module.exports = async (controller, name, oldName) => {
    logger.log(`Scene Change from ${oldName} to ${name}`);

    let newScene = name ?? '';
    newScene = newScene.replaceAll(' ', '');
    newScene = newScene.toLowerCase();

    let oldScene = oldName ?? '';
    oldScene = oldScene.replaceAll(' ', '');
    oldScene = oldScene.toLowerCase();

    //do nothing if not live, cloud server not live, in studio mode, cloud server not on Alveus Server
    let processChange = false;
    let cloudLive = (await controller.connections.obs.cloud.isLive()) || false;
    if (cloudLive) {
        let currentCloudScene =
            (await controller.connections.obs.cloud.getScene()) || '';
        //logger.log("localserver change, currentcloud: ",currentCloudScene)
        if (currentCloudScene == 'Alveus Server') {
            let localLive =
                (await controller.connections.obs.local.isLive()) || false;
            if (localLive) {
                let localStudioMode =
                    (await controller.connections.obs.local.isStudioMode()) ||
                    false;
                if (!localStudioMode) {
                    processChange = true;
                }
            }
        }
    }
    if (!processChange) {
        //do nothing
        return;
    }

    if (!pauseNotify) {
        let now = new Date();
        var hour = now.getUTCHours();

        if (hour >= notifyHours.start && hour < notifyHours.end) {
            let continueCheck = true;

            if (newScene == 'customcam' || oldScene == 'customcam') {
                //don't notify
                continueCheck = false;
            }

            let onewayList = onewayNotifications[oldScene];
            if (onewayList != null) {
                //check if leaving multiscene, allow child scenes.
                for (let i = 0; i < onewayList.length; i++) {
                    let sceneName = onewayList[i] || '';
                    sceneName = cleanName(sceneName);
                    if (newScene == sceneName) {
                        //don't notify
                        continueCheck = false;
                    }
                }
            }
            if (continueCheck) {
                logger.log('Notify: Not oneway');
                //Multiscene disable notification
                let newSceneIsMulti = false;
                let oldSceneIsMulti = false;
                for (let multiScene in multiScenes) {
                    let sceneList = multiScenes[multiScene];
                    //check if this is a multiscene and find parent camera
                    for (let i = 0; i < sceneList.length; i++) {
                        let sceneName = sceneList[i] || '';
                        sceneName = cleanName(sceneName);
                        if (newScene == sceneName) {
                            //found match
                            newSceneIsMulti = true;
                        } else if (oldScene == sceneName) {
                            //found match
                            oldSceneIsMulti = true;
                        }
                    }
                }
                if (newSceneIsMulti && oldSceneIsMulti) {
                    //if both scenes are part of multiscene, do not notify
                    continueCheck = false;
                }
            }

            //keep checking if not multiscene
            if (continueCheck) {
                logger.log(
                    'Notify: Not multiScenes',
                    notifyScenes,
                    newScene,
                    oldScene,
                );
                let foundNewName = false;
                let foundOldName = false;
                for (let i = 0; i < notifyScenes.length; i++) {
                    let notifySceneName = notifyScenes[i] ?? '';
                    notifySceneName = notifySceneName.replaceAll(' ', '');
                    notifySceneName = notifySceneName.toLowerCase();
                    if (newScene == notifySceneName) {
                        foundNewName = true;
                        break;
                    } else if (oldScene == notifySceneName) {
                        foundOldName = true;
                        break;
                    }
                }
                let timestamp = new Date().toLocaleString('en-US', {
                    timeZone: 'America/Chicago',
                });
                if (foundNewName) {
                    //notify its on
                    logger.log(
                        'Sending Notification newName. From: ',
                        oldName,
                        'to',
                        name,
                    );
                    controller.connections.courier.sendListNotificationDiscord(
                        'livecamalert',
                        'LivecamAlerts',
                        `${name} Active`,
                        `Livecam Switched to ${name}`,
                        [{ name: 'Time', value: timestamp }],
                    );
                } else if (foundOldName) {
                    //notify its off
                    logger.log(
                        'Sending Notification Oldname. From: ',
                        oldName,
                        'to',
                        name,
                    );
                    controller.connections.courier.sendListNotificationDiscord(
                        'livecamalert',
                        'LivecamAlerts',
                        `${oldName} No Longer Active`,
                        `Livecam Switched to ${name}`,
                        [{ name: 'Time', value: timestamp }],
                    );
                }
            }
        }
    }

    if (!pauseGameChange) {
        let justChattingCams = [
            'Backpack',
            'Backpack Server',
            'Alveus PC',
            'Nuthouse',
        ];
        let poolsCam = []; //["Georgie"];

        //Alveus Ambassador 24/7 Live Cam | NEW Holiday Sweater !merch | !alveus !hat !vid
        //lastStreamInfo = await controller.connections.twitch.getStreamInfo(config.alveusTwitchID);
        //logger.log("Twitch Info: ",lastStreamInfo.title," game: ",lastStreamInfo.gameName," gameid: ",lastStreamInfo.gameId);

        if (justChattingCams.includes(name)) {
            await controller.connections.twitch.setStreamInfo(
                alveusTwitchID,
                null,
                'chatting',
            );
        } else if (poolsCam.includes(name)) {
            await controller.connections.twitch.setStreamInfo(
                alveusTwitchID,
                null,
                'pools',
            );
        } else {
            await controller.connections.twitch.setStreamInfo(
                alveusTwitchID,
                null,
                'animals',
            );
        }
    }

    //Create Twitch Vod Markers
    if (!pauseTwitchMarker) {
        let markerCams = ['Nuthouse']; //"Backpack", "Backpack Server", "Alveus PC",

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
        let message = `Scene Changed to ${name}`;
        controller.connections.twitch.send('alveussanctuary', message);
    }
};
