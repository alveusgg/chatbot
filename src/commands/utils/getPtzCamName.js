'use strict';

const {
    customCommandAlias,
    axisCameraCommandMapping,
} = require('../../config/config');
const { cleanName } = require('../../utils/helper');

/**
 * @param {string} camera
 * @returns {string}
 */
module.exports = (camera) => {
    const cleanedName = cleanName(camera);
    const baseName = customCommandAlias[cleanedName] ?? cleanedName;
    return axisCameraCommandMapping[baseName] ?? baseName;
};
