'use strict';

const { cleanName } = require('../../utils/helper.js');

/**
 * @param {import('../../connections/obs.js').OBSConnection} obs
 * @returns {string}
 */
module.exports = async (obs) => {
    const currentScene = await obs.local.getScene() || obs.local?.currentScene || '';

    return cleanName(currentScene);
};
