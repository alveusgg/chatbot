'use strict';

const { axisCameraCommandMapping } = require('../../config/config');
const { cleanName } = require('../../utils/helper');
const getCurrentScene = require('./getCurrentScene');
const getPtzCamName = require('./getPtzCamName');

/**
 *
 * @param {import('../../connections/obs.js').OBSConnection} obs
 * @param {import('../../connections/cameras.js').CamerasConnection} cameras
 * @param {import('../../connections/database.js').DatabaseConnection} database
 * @param {Array<string>} args
 * @returns {[string, string, Array<string>, string | undefined]}
 */
module.exports = (obs, cameras, database, args) => {
    let currentScene = await getCurrentScene(obs);
    /**
     * @type {string | undefined}
     */
    let specificCamera;

    let ptzCameraName = getPtzCamName(args[1]);
    if (cameras[ptzCameraName]) {
        currentScene = ptzCameraName;
        specificCamera = ptzCameraName;

        // Remove the camera arg
        args = args.splice(0, 1);
    } else if (currentScene === 'custom') {
        // No specific modifier
        const currentCamList = database['customcam'];

        const firstScene = cleanName(currentCamList[0] || '');
        ptzCameraName = axisCameraCommandMapping[firstScene] ?? firstScene;

        if (cameras[ptzCameraName]) {
            currentScene = ptzCameraName;
            specificCamera = ptzCameraName;
        }
    }

    return [currentScene, ptzCameraName, args, specificCamera];
};
