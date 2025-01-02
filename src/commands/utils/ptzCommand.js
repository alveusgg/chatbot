'use strict';

const ptzCommandSetup = require('./ptzCommandSetup.js');
const checkLockoutPTZAccess = require('../../utils/checkLockoutPTZAccess');
const { cleanName } = require('../../utils/helper.js');
const { customCommandAlias, groupMemberships, newGroupsToOldMapping, userPermissions } = require('../../config/config.js');
const Logger = require('../../utils/logger.js');

const logger = new Logger();

/**
 * @typedef {import('../types').CommandArgs & {
 *   currentScene: string,
 *   ptzCameraName?: string,
 *   specificCamera?: string,
 *   camera: import('../../connections/cameras.js').Axis | undefined,
 *   rawArgs: Array<string>
 * }} PtzCommandArgs
 * 
 * @typedef {Omit<import('../types').Command, 'run'> & {
 *   checkPtzLockout?: boolean,
 *   run: (args: PtzCommandArgs) => void | Promise<void>;
 * }} PtzCommand
 */

/**
 * @param {import('../../controller.js')} controller
 * @param {PtzCommand} ptzCommand
 * @returns {import("../types").Command}
 */
module.exports = (controller, ptzCommand) => {
    const { connections: { obs, cameras, database } } = controller;

    return {
        ...ptzCommand,
        enabled: !!obs && !!cameras && !!database && ptzCommand.enabled,
        run: async (commandArgs) => {
            // TODO don't call ptzCommandSetup and do the stuff here
            const {
                currentScene,
                ptzCameraName,
                specificCamera,
                args,
                camera
            } = await ptzCommandSetup(obs, cameras, database, commandArgs.args);

            if (ptzCommand.checkPtzLockout === undefined || ptzCommand.checkPtzLockout === true) {
                let camName = cleanName(currentScene);
                let baseName = customCommandAlias[camName];
                if (!checkLockoutPTZAccess(controller, baseName)) {
                    let lockedCam = true;

                    // Override if high enough permission
                    let cam = database.lockoutPTZ[baseName] || {};
                    let camPermission = cam.accessLevel;
                    let userPermission = newGroupsToOldMapping[groupMemberships[commandArgs.user]];
                    let permissionRanks = userPermissions.commandPriority;
               
                    let camIndex = permissionRanks.indexOf(camPermission);
                    let userIndex = permissionRanks.indexOf(userPermission);

                    // Combine admin and superuser access
                    if (camIndex == 0) {
                        camIndex++;
                    }

                    if (camIndex !== -1 && userIndex !== -1) {
                        if (userIndex <= camIndex) {
                            // Have permission
                            lockedCam = false;
                        }
                    }
                    if (lockedCam) {
                        logger.log("PTZ Locked Camera", camName)
                        return;
                    }     
                }
            }

            return ptzCommand.run({
                ...commandArgs,
                rawArgs: commandArgs.args,
                currentScene,
                ptzCameraName,
                specificCamera,
                args,
                camera
            });
        }
    }
}
