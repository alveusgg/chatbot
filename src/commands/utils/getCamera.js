'use strict';

const { multiScenes } = require('../../config/config.js');
const { cleanName } = require('../../utils/helper.js');

/**
 * @param {import('../../connections/cameras.js').CamerasConnection} cameras
 * @param {string} scene
 * @returns {import('../../connections/cameras.js').Axis | undefined}
 */
module.exports = (cameras, scene) => {
    const camera = cameras[scene];
    if (camera) {
        // Found it
        return camera;
    }

    // There's multiple or extra scenes, let's try to narrow it down

    /**
     * @type {string | undefined}
     */
    let parentScene;

    multiSceneLoop: for (const multiScene in multiScenes) {
        const sceneList = multiScenes[multiScene];

        for (let i = 0; i < sceneList.length; i++) {
            let sceneName = cleanName(sceneList[i] || '');

            if (scene == sceneName) {
                parentScene = multiScene;
                break multiSceneLoop;
            }
        }
    }

    if (parentScene) {
        return cameras[cleanName(parentScene)] || undefined;
    }

    return undefined;
};
