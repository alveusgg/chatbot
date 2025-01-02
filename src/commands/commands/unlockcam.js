'use strict';

const config = require('../../config/config.js');
const helper = require('../../utils/helper.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { database } }) => {
    return {
        name: 'unlockcam',
        aliases: [
            "unlock",
            "camunlock"
        ],
        enabled: !!database,
        permission: {
            group: 'operator'
        },
        run: async ({ user, args }) => {
            let unlockList = [];
            if (args[1] == "all") {
                unlockList = Object.keys(database.lockoutCams);
            } else {
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
                            unlockList.push(overrideArgs);
                        }

                    }
                }
            }

            const userGroup = config.groupMemberships[user];
            const userPermission = config.newGroupsToOldMapping[userGroup];

            if (unlockList.length > 0) {
                // logger.log(`Unlock Cams (${accessProfile.user}-${accessProfile.accessLevel}): ${unlockList}`);
                for (let camName of unlockList) {
                    //check permission level
                    let cam = database.lockoutCams[camName];
                    if (cam == null) {
                        //not locked
                        continue;
                    }
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
            }
        }
    }
}
