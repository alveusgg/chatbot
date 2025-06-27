'use strict';

const config = require('../../config/config.js');
const helper = require('../../utils/helper.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { database } }) => {
    return {
        name: 'lockbothcam',
        aliases: [
            "lockboth",
            "lockall",
            "lockb",
            "lc"
        ],
        enabled: !!database,
        permission: {
            group: 'operator'
        },
        run: async ({ user, args }) => {
            // Remove command name from args
            args.shift();

            let lockoutallList = [];
            let lockoutAllTime = 0;
            for (let arg of args) {
                if (arg != null && arg != "") {
                    //get lock duration if exists
                    let time = helper.formatTimestampToSeconds(arg);
                    if (time != null && time >= 0) {
                        //time argument
                        lockoutAllTime = time;
                        continue;
                    }

                    //check for cam name
                    let camName = helper.cleanName(arg);

                    let overrideArgs = config.customCommandAlias[camName];
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
                        lockoutallList.push(overrideArgs);
                    }

                }
            }

            if (lockoutallList.length > 0) {
                let now = new Date();
                const userGroup = config.groupMemberships[user];
                const accessLevel = config.newGroupsToOldMapping[userGroup];
                for (let cam of lockoutallList) {
                    database.lockoutCams[cam] = { user, accessLevel, locked: true, duration: lockoutAllTime, timestamp: now };
                    database.lockoutPTZ[cam] = {user, accessLevel,locked: true,duration:lockoutAllTime,timestamp:now};
                }
            }
        }
    }
}
