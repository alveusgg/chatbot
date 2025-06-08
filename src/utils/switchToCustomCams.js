'use strict';

const {
    customCommandAlias,
    multiCustomCamScenesConverted,
    timeRestrictedScenes,
    restrictedHours,
    scenePositions,
    pauseCloudSceneChange,
    globalMusicSource,
    micGroups,
    userPermissions,
} = require('../config/config');
const checkLockoutAccess = require('./checkLockoutAccess');
const { cleanName } = require('./helper');
const Logger = require('./logger');

const logger = new Logger();

/**
 * @param {import('../connections/obs').OBSConnection} obs
 * @param {*} obsSources
 * @param {*} sceneName
 * @param {*} camList
 * @param {*} toggleMap
 * @param {*} positions
 */
async function setCustomCams(
    obs,
    obsSources,
    sceneName,
    camList,
    toggleMap,
    positions,
) {
    // Skip disabling anything with "overlay" in the name
    // Toggle anythig inside toggleMap off except the value
    try {
        let sceneItems = obsSources;
        let sceneMap = {};
        for (let item of sceneItems) {
            let sourceName = item.sourceName || '';
            sourceName = sourceName.replaceAll(' ', '');
            sourceName = sourceName.toLowerCase();
            let sourceId = item.sceneItemId;
            let visibility = item.sceneItemEnabled;
            let index = item.sceneItemIndex;
            let type = item.sourceType; //'OBS_SOURCE_TYPE_SCENE'
            sceneMap[sourceName] = {
                sourceName,
                sourceId,
                index,
                visibility,
                type,
            };
        }

        let indexOrder = [];
        for (let i = 0; i < camList.length; i++) {
            let pos = positions[i + 1];
            if (pos == null) {
                continue;
            }

            let cam = camList[i] || '';
            cam = cam.replaceAll(' ', '');
            cam = cam.toLowerCase();

            if (cam == '') {
                continue;
            }

            camList[i] = cam;

            let camInfo = sceneMap[cam] || {};
            let sourceId = camInfo.sourceId || '';
            let index = camInfo.index || 0;
            if (sourceId == '') {
                continue;
            }
            indexOrder.push(index);
            await obs.local.setSceneItemIdTransform(sceneName, sourceId, pos);
        }

        for (let item of sceneItems) {
            let sourceName = item.sourceName || '';
            sourceName = sourceName.replaceAll(' ', '');
            sourceName = sourceName.toLowerCase();
            let sourceId = item.sceneItemId;
            let visibility = item.sceneItemEnabled;
            let type = item.sourceType; //'OBS_SOURCE_TYPE_SCENE'

            // Toggle off anything with baseName in it, except its value
            for (let baseName in toggleMap) {
                let base = baseName.replaceAll(' ', '');
                base = base.toLowerCase();

                let dontSkip = toggleMap[baseName];
                dontSkip = dontSkip.replaceAll(' ', '');
                dontSkip = dontSkip.toLowerCase();

                if (sourceName.includes(base)) {
                    if (sourceName.includes(dontSkip)) {
                        //enable
                        await obs.local.setSceneItemIdEnabled(
                            sceneName,
                            sourceId,
                            true,
                        );
                    } else {
                        //disable
                        await obs.local.setSceneItemIdEnabled(
                            sceneName,
                            sourceId,
                            false,
                        );
                    }
                }
            }

            // Only toggle scene's
            if (
                type != 'OBS_SOURCE_TYPE_SCENE' ||
                sourceName.includes('overlay')
            ) {
                // Skip over anything else with Overlay
                continue;
            }

            // OBS Type SCENE
            if (camList.includes(sourceName) && visibility != true) {
                // Enable if its in the list
                await obs.local.setSceneItemIdEnabled(
                    sceneName,
                    sourceId,
                    true,
                );
            } else if (!camList.includes(sourceName) && visibility != false) {
                // Disable
                await obs.local.setSceneItemIdEnabled(
                    sceneName,
                    sourceId,
                    false,
                );
            }
        }

        //order the cam's
        // indexOrder.reverse();
        // OBS Higher number = Top of list. 0 is bottom
        //sort ascending  order
        indexOrder.sort(function (a, b) {
            return a - b;
        });
        let lastindex = 0;
        for (let i = 0; i < camList.length; i++) {
            let name = camList[i];
            let camInfo = sceneMap[name] || {};

            let sourceId = camInfo.sourceId || '';
            if (sourceId == '') {
                continue;
            }

            lastindex = indexOrder[i] ?? lastindex;
            if (lastindex < 7) {
                lastindex = 7;
            }

            await obs.local.setSceneItemIndex(sceneName, sourceId, lastindex);
        }

        // Toggle music based on cameras
        let foundMic = false;
        for (const grp in micGroups) {
            for (const source in micGroups[grp]) {
                if (source == 'fox') {
                    continue;
                }

                let micName = source || '';
                micName = micName.toLowerCase();

                for (let i = 0; i < camList.length; i++) {
                    let camName = camList[i] || '';
                    camName = camName.toLowerCase();
                    if (
                        micName != '' &&
                        camName != '' &&
                        camName.includes(micName)
                    ) {
                        foundMic = true;
                        break;
                    }
                }

                if (foundMic) {
                    break;
                }
            }

            if (foundMic) {
                break;
            }
        }

        if (!foundMic) {
            //turn on music if no camera has a mic
            obs.cloud.setMute(globalMusicSource, false);
        }

        logger.log(`setCustomCams - ${sceneName} (${camList})`);
        return true;
    } catch (e) {
        logger.log(
            `Error setCustomCams (${sceneName},${camList}): ${JSON.stringify(
                e,
            )}`,
        );
        return null;
    }
}

/**
 * @param {import('../controller')} controller
 * @param {string} channel
 * @param {keyof typeof import('../config/config').groups | undefined} userGroup Group that the user causing the switch is in
 * @param {string} commandName
 * @param {string} [fullArgs='']
 */
module.exports = async (
    { connections: { api, obs, database, twitch } },
    channel,
    userGroup,
    commandName,
    fullArgs = '',
) => {
    const obsSources = (await obs?.local.getSceneItemList('Custom Cams')) || [];
    const obsList = [];
    const currentCamList = [];

    for (const { sceneName, sceneItemEnabled } of obsSources) {
        if (sceneName.includes('fullcam')) {
            const cleanedSceneName = cleanName(sceneName);
            obsList.push(sceneName);

            if (sceneItemEnabled) {
                currentCamList.push(cleanedSceneName);
            }
        }
    }

    fullArgs = fullArgs.trim();

    const argsList = fullArgs.split(' ');
    argsList.splice(6);

    let camList = [];

    let validCommand = true;
    let invalidAccess = false;

    let newArgList = [];

    // Convert to basenames
    for (let arg of argsList) {
        if (arg === null || arg === '') {
            continue;
        }

        let camName = cleanName(arg);

        const overrideArgs = customCommandAlias[camName];
        if (overrideArgs) {
            // Allow alias to change entire argument
            const newArgs = overrideArgs.split(' ');
            if (newArgs.length > 1) {
                for (let newArg of newArgs) {
                    if (newArg !== '') {
                        newArgList.push(newArg);
                    }
                }
            }

            camName = overrideArgs;
        }

        newArgList.push(camName);
    }

    // Check for access to the cams
    for (const camName of newArgList) {
        // const fullCamName = `fullcam${camName}`;

        const isEmptyOrBlank = camName === 'empty' || camName === 'blank';

        // Check if valid source
        if (!obsList.includes(camName) && !isEmptyOrBlank) {
            validCommand = false;
            break;
        }

        let hasAccess = false;
        if (currentCamList.includes(camName) || isEmptyOrBlank) {
            hasAccess = true;
        }

        // convert name to base name & check if it's multiscene
        const baseCamName = multiCustomCamScenesConverted[camName];
        if (!hasAccess && baseCamName) {
            for (let currentCam of currentCamList) {
                currentCam = currentCam ?? '';

                const baseName =
                    multiCustomCamScenesConverted[currentCam] || '';

                // newcam is part of a current cam multiscene
                if (baseCamName !== '' && baseCamName === baseName) {
                    hasAccess = true;
                    break;
                }
            }
        }

        if (!hasAccess) {
            const isSceneTimeRestricted =
                timeRestrictedScenes.includes(camName);

            if (userGroup === 'admin' || userGroup === 'superUser') {
                hasAccess = true;
            } else if (!isSceneTimeRestricted) {
                logger.log(
                    'Reached Regular Access',
                    'Non time restricted',
                    camName,
                );
                hasAccess = true;
            } else if (userGroup === 'mod') {
                logger.log('Reached Mod Access', camName);

                // Not directly allowed
                // Check if allowed access to cam
                // Specific mod time restrictions
                if (isSceneTimeRestricted) {
                    const now = new Date();
                    const hour = now.getUTCHours();

                    if (
                        hour >= restrictedHours.start &&
                        hour < restrictedHours.end
                    ) {
                        // Restricted time
                        hasAccess = false;
                    } else {
                        // Unrestricted time
                        hasAccess = true;
                    }
                } else {
                    logger.log(
                        'Reached Mod Access',
                        'Non time restricted',
                        camName,
                    );
                    hasAccess = true;
                }
            } else {
                // Too low of permission
                logger.log(
                    `Switch Cams: Too Low Permission`,
                    userGroup,
                    fullArgs,
                );
                validCommand = false;
                invalidAccess = true;
                break;
            }
        }

        if (hasAccess) {
            camList.push(`fullcam${camName}`);
        } else {
            validCommand = false;
            invalidAccess = true;
            break;
        }
    }

    if (!validCommand) {
        logger.log(
            'Switch Cams: Invalid Command',
            userGroup,
            'fullargs',
            fullArgs,
        );

        // Doesnt have access to one of the cams
        if (invalidAccess) {
            twitch.send(channel, `Invalid Access`);
        } else {
            twitch.send(channel, `Invalid Command`);
        }

        return;
    }

    //check lock status
    let lockedCam = false;
    for (let currentLoc = 0; currentLoc < currentCamList.length; currentLoc++) {
        let cam = currentCamList[currentLoc];
        let camName = cleanName(cam);
        let baseName = customCommandAlias[camName];
        // todo what do here cause we don't have the full controller obj
        if (!checkLockoutAccess(controller, baseName)) {
            //check if it exists and is in same slot of newlist

            const newLoc = camListClean.indexOf(cam);
            //-1 means removing cam-locked cam not found in new list
            //locked cam not in same slot
            if (newLoc == -1 || (camListClean.length > 1 && currentLoc != newLoc)) {

                lockedCam = true;

                //Override if high enough permission
                let cam = database.lockoutCams[baseName] || {};
                let camPermission = cam.accessLevel;
                let userPermission = accessProfile.accessLevel;
                let permissionRanks = userPermissions.commandPriority;

                let camIndex = permissionRanks.indexOf(camPermission);
                let userIndex = permissionRanks.indexOf(userPermission);

                //combine admin and superuser access
                if (camIndex == 0) {
                    camIndex = camIndex + 1;
                }

                if (camIndex !== -1 && userIndex !== -1) {
                    if (userIndex <= camIndex) {
                        //have permission
                        lockedCam = false;
                    }
                }
            }
        }
    }
    for (let newLoc = 0; newLoc < camList.length; newLoc++) {
        let cam = currentCamList[newLoc];
        let camName = cleanName(cam);
        let baseName = customCommandAlias[camName];
        if (!checkLockoutAccess(controller, baseName)) {
            //check if it exists and is in same slot of newlist

            const currentLoc = currentCamList.indexOf(cam);
            if (currentLoc == -1) {
                //adding cam-locked cam not found in new list
                lockedCam = true;

                //Override if high enough permission
                let cam = controller.connections.database.lockoutCams[baseName] || {};
                let camPermission = cam.accessLevel;
                let userPermission = accessProfile.accessLevel;
                let permissionRanks = userPermissions.commandPriority;

                let camIndex = permissionRanks.indexOf(camPermission);
                let userIndex = permissionRanks.indexOf(userPermission);

                //combine admin and superuser access
                if (camIndex == 0) {
                    camIndex++;
                }

                if (camIndex !== -1 && userIndex !== -1) {
                    if (userIndex <= camIndex) {
                        //have permission
                        lockedCam = false;
                    }
                }
            }
        }
    }
    if (lockedCam) {
        logger.log("Switch Cams: Locked Camera", accessProfile, "fullargs", fullArgs);
        return;
    }

    const currentScene = cleanName(obs.local.currentScene || '');

    if (
        currentScene === 'custom' &&
        fullArgs === '' &&
        currentCamList.length > 0
    ) {
        camList = currentCamList;
    }

    let response = null;
    if (camList.length >= 5) {
        response = await setCustomCams(
            obs,
            obsSources,
            'Custom Cams',
            camList,
            { border: '6CamBigBorder' },
            scenePositions['6boxbig'],
        );
    } else if (camList.length >= 4 && commandName == 'customcamsbig') {
        response = await setCustomCams(
            obs,
            obsSources,
            'Custom Cams',
            camList,
            { border: '4CamBigBorder' },
            scenePositions['4boxbig'],
        );
    } else if (camList.length >= 4) {
        response = await setCustomCams(
            obs,
            obsSources,
            'Custom Cams',
            camList,
            { border: '4CamBorder' },
            scenePositions['4box'],
        );
    } else if (camList.length >= 3 && commandName == 'customcamsbig') {
        response = await setCustomCams(
            obs,
            obsSources,
            'Custom Cams',
            camList,
            { border: '4CamBigBorder' },
            scenePositions['3boxbig'],
        );
    } else if (camList.length >= 3) {
        response = await setCustomCams(
            obs,
            obsSources,
            'Custom Cams',
            camList,
            { border: '3CamBorder' },
            scenePositions['3box'],
        );
    } else if (camList.length >= 2 && commandName == 'customcamsbig') {
        response = await setCustomCams(
            obs,
            obsSources,
            'Custom Cams',
            camList,
            { border: '4CamBigBorder' },
            scenePositions['2boxbig'],
        );
    } else if (camList.length >= 2 && commandName == 'customcamstl') {
        response = await setCustomCams(
            obs,
            obsSources,
            'Custom Cams',
            camList,
            { border: '2CamTopleftBorder' },
            scenePositions['2boxtl'],
        );
    } else if (camList.length >= 2 && commandName == 'customcamstr') {
        response = await setCustomCams(
            obs,
            obsSources,
            'Custom Cams',
            camList,
            { border: '2CamToprightBorder' },
            scenePositions['2boxtr'],
        );
    } else if (camList.length >= 2 && commandName == 'customcamsbl') {
        response = await setCustomCams(
            obs,
            obsSources,
            'Custom Cams',
            camList,
            { border: '2CamBottomleftBorder' },
            scenePositions['2boxbl'],
        );
    } else if (camList.length >= 2 && commandName == 'customcamsbr') {
        response = await setCustomCams(
            obs,
            obsSources,
            'Custom Cams',
            camList,
            { border: '2CamBottomrightBorder' },
            scenePositions['2boxbr'],
        );
    } else if (camList.length >= 2) {
        response = await setCustomCams(
            obs,
            obsSources,
            'Custom Cams',
            camList,
            { border: '2CamBorder' },
            scenePositions['2box'],
        );
    } else if (camList.length >= 1) {
        response = await setCustomCams(
            obs,
            obsSources,
            'Custom Cams',
            camList,
            { border: '1CamBorder' },
            scenePositions['1box'],
        );
    }

    if (response) {
        await obs.local.setScene('Custom Cams');

        if (!pauseCloudSceneChange) {
            setTimeout(() => {
                obs.cloud.setScene('Alveus Server');
            }, 500);
        }

        database['customcam'] = camList;
        database['customcamsbig'] = commandName === 'customcamsbig';
        database['customcamscommand'] = commandName;
    }

    const broadcastMessage = {
        userCommand: commandName,
        fullArgs,
    };

    api.sendBroadcastMessage(broadcastMessage);
};
