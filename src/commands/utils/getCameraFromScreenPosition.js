'use strict'

const { scenePositions } = require('../../config/config');

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
 * @returns {SceneLayout | undefined}
 */
function getSceneLayout(database) {
  const currentCamList = database['customcam'];
  const camLayout = database['customcamscommand'];
  
  if (currentCamList.length >= 5) {
    return '6bigbox';
  } else if (currentCamList.length >= 4 && camLayout == 'customcams') {
    return '4box';
  } else if (currentCamList.length >= 4 && camLayout == 'customcamsbig') {
    return '4boxbig';
  } else if (currentCamList.length >= 3 && camLayout == 'customcams') {
    return '3box';
  } else if (currentCamList.length >= 3 && camLayout == 'customcamsbig') {
    return '3boxbig';
  } else if (currentCamList.length >= 2 && camLayout == 'customcams') {
    return '2box';
  } else if (currentCamList.length >= 2 && camLayout == 'customcamsbig') {
    return '2boxbig';
  } else if (currentCamList.length >= 2 && camLayout == 'customcamstl') {
    return '2boxtl';
  } else if (currentCamList.length >= 2 && camLayout == 'customcamstr') {
    return '2boxtr';
  } else if (currentCamList.length >= 2 && camLayout == 'customcamsbl') {
    return '2boxbl';
  } else if (currentCamList.length >= 2 && camLayout == 'customcamsbr') {
    return '2boxbr';
  } else if (currentCamList.length >= 1) {
    return '1box';
  }

  return undefined;
}

/**
 * @param {import('../../connections/database.js').DatabaseConnection} database 
 * @param {number} x 
 * @param {number} y 
 * @returns {CameraInBox}
 */
module.exports = (database, x, y) => {
  const sceneLayout = getSceneLayout(database);

  const zones = Object.values(scenePositions[sceneLayout]);

  // let zone = 01;
  // todo finish this

  return {}
}
