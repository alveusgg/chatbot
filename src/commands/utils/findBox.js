'use strict';

const {
    scenePositions,
    customCommandAlias,
    axisCameraCommandMapping,
    multiScenes,
} = require('../../config/config');
const { cleanName } = require('../../utils/helper.js');
const Logger = require('../../utils/logger.js');

const logger = new Logger();

/**
 * @typedef {keyof typeof import('../../config/config.js').scenePositions} SceneLayout
 *
 * @typedef {{
 *   x: number,
 *   y: number,
 *   sourceWidth: number,
 *   sourceHeight: number,
 *   scaleX: number,
 *   scaleY: number,
 *   ptzCameraName: string,
 *   zone: number
 * }} CameraInBox
 */

/**
 * @param {import('../../connections/database.js').DatabaseConnection} database
 * @param {number} xcord
 * @param {number} ycord
 * @returns {CameraInBox | false}
 */
module.exports = (database, xcord, ycord) => {
    let currentCamList = database['customcam'];
    let camLayout = database['customcamscommand'];
    let sceneLayout;

    if (currentCamList.length >= 5) {
        sceneLayout = '6boxbig';
    } else if (currentCamList.length >= 4 && camLayout == 'customcams') {
        sceneLayout = '4box';
    } else if (currentCamList.length >= 4 && camLayout == 'customcamsbig') {
        sceneLayout = '4boxbig';
    } else if (currentCamList.length >= 3 && camLayout == 'customcams') {
        sceneLayout = '3box';
    } else if (currentCamList.length >= 3 && camLayout == 'customcamsbig') {
        sceneLayout = '3boxbig';
    } else if (currentCamList.length >= 2 && camLayout == 'customcams') {
        sceneLayout = '2box';
    } else if (currentCamList.length >= 2 && camLayout == 'customcamsbig') {
        sceneLayout = '2boxbig';
    } else if (currentCamList.length >= 2 && camLayout == 'customcamstl') {
        sceneLayout = '2boxtl';
    } else if (currentCamList.length >= 2 && camLayout == 'customcamstr') {
        sceneLayout = '2boxtr';
    } else if (currentCamList.length >= 2 && camLayout == 'customcamsbl') {
        sceneLayout = '2boxbl';
    } else if (currentCamList.length >= 2 && camLayout == 'customcamsbr') {
        sceneLayout = '2boxbr';
    } else if (currentCamList.length >= 1) {
        sceneLayout = '1box';
    }

    // Use the configuration data to determine zones
    const zones = Object.values(scenePositions[sceneLayout]);
    let x_unscaled = xcord;
    let y_unscaled = ycord;

    // Initialize zone to -1
    let zone = -1;
    let x = 960;
    let y = 540;
    let sourceWidth;
    let sourceHeight;
    let scaleX;
    let scaleY;

    // Determine the zone and scaled coordinates
    if (
        sceneLayout === '2boxtl' ||
        sceneLayout === '2boxtr' ||
        sceneLayout === '2boxbl' ||
        sceneLayout === '2boxbr'
    ) {
        // Define the zones with PiP prioritized
        const zones = [
            { ...scenePositions[sceneLayout][2], index: 2 }, // PiP (zone2)
            { ...scenePositions[sceneLayout][1], index: 1 }, // Main (zone1)
        ];

        // Check if the click is within any of the zones
        for (const z of zones) {
            if (
                x_unscaled >= z.positionX &&
                x_unscaled < z.positionX + z.width &&
                y_unscaled >= z.positionY &&
                y_unscaled < z.positionY + z.height
            ) {
                // Click is within this zone
                zone = z.index - 1; // Use the zone index (1 for fullscreen, 2 for PiP)
                x = (x_unscaled - z.positionX) / z.scaleX;
                y = (y_unscaled - z.positionY) / z.scaleY;
                sourceWidth = z.sourceWidth;
                sourceHeight = z.sourceHeight;
                scaleX = z.scaleX;
                scaleY = z.scaleY;
                logger.log('pip zone hit number:', zone);
                break;
            }
        }
    } else {
        for (let i = 0; i < zones.length; i++) {
            const z = zones[i];

            if (
                x_unscaled >= z.positionX &&
                x_unscaled < z.positionX + z.width &&
                y_unscaled >= z.positionY &&
                y_unscaled < z.positionY + z.height
            ) {
                zone = i; // Use 0-based index for zones
                x = (x_unscaled - z.positionX) / z.scaleX;
                y = (y_unscaled - z.positionY) / z.scaleY;
                sourceWidth = z.sourceWidth;
                sourceHeight = z.sourceHeight;
                scaleX = z.scaleX;
                scaleY = z.scaleY;
                break;
            }
        }
    }

    // If invalid coordinates or no matching zone, return false
    if (zone === -1) {
        return false;
    }

    // Determine camera name using 0-based index
    let camName = currentCamList[zone];
    if (camName === undefined) {
        return false;
    }

    let ptzCameraName = cleanName(camName);
    let baseName = customCommandAlias[ptzCameraName] ?? ptzCameraName;
    ptzCameraName = axisCameraCommandMapping[baseName] ?? baseName;

    // Check if camName contains "multi" and find the parent scene if it does
    if (ptzCameraName.includes('multi')) {
        let parentScene = '';
        // Iterate through the multiScenes to find the parent scene
        for (let multiScene in multiScenes) {
            let sceneList = multiScenes[multiScene];

            for (let i = 0; i < sceneList.length; i++) {
                let sceneName = sceneList[i] || '';
                sceneName = cleanName(sceneName);
                if (ptzCameraName == sceneName) {
                    // Found match
                    parentScene = multiScene;
                    break;
                }
            }

            // Exit outer loop if parentScene is found
            if (parentScene != '') {
                break;
            }
        }
        // Set camName to parentScene if a match was found
        if (parentScene != '') {
            ptzCameraName = parentScene;
        }
    }

    return {
        x,
        y,
        sourceWidth,
        sourceHeight,
        scaleX,
        scaleY,
        ptzCameraName,
        zone,
    };
};
