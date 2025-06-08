'use strict';

const { axisCameraCommandMapping } = require('../../config/config');
const { cleanName } = require('../../utils/helper.js');
const getCamera = require('./getCamera');
const getCurrentScene = require('./getCurrentScene.js');
const getPtzCamName = require('./getPtzCamName');

/**
 * @typedef {{
 *   currentScene: string,
 *   ptzCameraName?: string,
 *   specificCamera?: string,
 *   args: Array<string>,
 *   camera: import('../../connections/cameras.js').Axis | undefined
 * }} PtzCommandInfo
 */

/**
 * @param {import('../../connections/obs.js').OBSConnection} obs
 * @param {import('../../connections/cameras.js').CamerasConnection} cameras
 * @param {import('../../connections/database.js').DatabaseConnection} database
 * @param {Array<string>} args
 * @returns {PtzCommandInfo}
 */
module.exports = async (obs, cameras, database, args) => {
    /**
     * @type {PtzCommandInfo}
     */
    const info = {
        currentScene: await getCurrentScene(obs),
        args: args,
    };

    let ptzCameraName = getPtzCamName(args[1]);
    if (cameras[ptzCameraName]) {
        info.currentScene = ptzCameraName;
        info.specificCamera = ptzCameraName;

        // Remove the camera arg
        info.args = info.args.splice(0, 1);
    } else if (info.currentScene === 'custom') {
        // No specific modifier
        const currentCamList = database['customcam'];

        const firstScene = cleanName(currentCamList[0] || '');
        ptzCameraName = axisCameraCommandMapping[firstScene] ?? firstScene;

        if (cameras[ptzCameraName]) {
            info.currentScene = ptzCameraName;
            info.specificCamera = ptzCameraName;
        }
    }

    info.camera = getCamera(cameras, info.currentScene);

    if (args[0] !== 'ptzroaminfo') {
        database[info.currentScene].isRoaming = false;
    }

    return info;
};
