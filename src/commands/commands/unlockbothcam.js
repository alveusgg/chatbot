'use strict';

const config = require('../../config/config.js');
const helper = require('../../utils/helper.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { database } }) => {
    return {
        name: 'unlockbothcam',
        aliases: [
            "unlockboth",
            "unlockall",
            "unlockb",
            "uc"
        ],
        enabled: !!database,
        permission: {
            group: 'operator'
        },
        run: async ({ user, args }) => {
            let unlockallList = [];
            if (args[1] == "all") {
                unlockallList = [...new Set([...Object.keys(database.lockoutCams), ...Object.keys(database.lockoutPTZ)])]
            } else {
                // Remove command name from args
                args.shift();

                for (let arg of args) {
                    if (arg != null && arg != "") {
    
                        //check for cam name
                        let camName = helper.cleanName(arg);
    
                        let overrideArgs = config.customCommandAlias[camName] || camName;
                        if (overrideArgs != null) {
                            //allow alias to change entire argument
                            let newArgs = overrideArgs.split(" ");
                            if (newArgs.length > 1) {
                                for (let newarg of newArgs) {
                                    if (newarg != "") {
                                        args.push(newarg);
                                    }
                                }
                                continue;
                            }
                            unlockallList.push(overrideArgs);
                        }
    
                    }
                }
            }

            const userGroup = config.groupMemberships[user];
            const userPermission = config.newGroupsToOldMapping[userGroup];

            if (unlockallList.length > 0) {
                // logger.log(`Unlock Cams (${accessProfile.user}-${accessProfile.accessLevel}): ${unlockallList}`);
                for (let camName of unlockallList) {
                    //check permission level
                    let cam = database.lockoutCams[camName];
                    if (cam != null) {
                        let camPermission = cam.accessLevel;
                        let permissionRanks = config.userPermissions.commandPriority;

                        let camIndex = permissionRanks.indexOf(camPermission);
                        let userIndex = permissionRanks.indexOf(userPermission);
                        //combine admin and superuser access
                        if (camIndex == 0) {
                            camIndex++;
                        }

                        if (camIndex !== -1 && userIndex !== -1) {
                            if (userIndex <= camIndex) {
                                delete database.lockoutCams[camName];
                            }
                        }
                    }
                    let ptz = database.lockoutPTZ[camName];
                    if (ptz != null) {
                        let ptzPermission = ptz.accessLevel;
                        let permissionRanks = config.userPermissions.commandPriority;

                        let ptzIndex = permissionRanks.indexOf(ptzPermission);
                        let userIndex = permissionRanks.indexOf(userPermission);
                        //combine admin and superuser access
                        if (ptzIndex == 0) {
                            ptzIndex++;
                        }

                        if (ptzIndex !== -1 && userIndex !== -1) {
                            if (userIndex <= ptzIndex) {
                                delete database.lockoutPTZ[camName];
                            }
                        }
                    }
                }
            }
        }
    }
}
