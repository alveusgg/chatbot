'use strict';

const config = require('../../config/config.js');
const helper = require('../../utils/helper.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { database } }) => {
    return {
        name: 'unlockptz',
        aliases: [
            "unlockcamptz","unlockptzcam","ptzunlock"
        ],
        enabled: !!database,
        permission: {
            group: 'operator'
        },
        run: async ({ user, args }) => {
            let unlockPTZList = [];
            if (args[1] == "all") {
                unlockPTZList = Object.keys(database.lockoutPTZ);
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
                            unlockPTZList.push(overrideArgs);
                        }

                    }
                }
            }

            const userGroup = config.groupMemberships[user];
            const userPermission = config.newGroupsToOldMapping[userGroup];

            if (unlockPTZList.length > 0) {
                // logger.log(`Unlock Cams (${accessProfile.user}-${accessProfile.accessLevel}): ${unlockPTZList}`);
                for (let camName of unlockPTZList) {
                    //check permission level
                    let cam = database.lockoutPTZ[camName];
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
                            delete database.lockoutPTZ[camName];
                        }
                    }
                }
            }
        }
    }
}
