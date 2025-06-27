'use strict';

const config = require('../../config/config.js');
const helper = require('../../utils/helper.js');
const Logger = require('../../utils/logger.js');

const logger = new Logger();

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { database } }) => {
    return {
        name: 'lockcam',
        aliases: [
            "lockout",
            "lock",
            "camlock"
        ],
        enabled: !!database,
        permission: {
            group: 'operator'
        },
        run: async ({ user, args }) => {
            // Remove command name from args
            args.shift();

            let lockoutList = [];
            let lockoutTime = 0;
            for (let arg of args) {
                if (arg != null && arg != "") {
                    //get lock duration if exists
                    let time = helper.formatTimestampToSeconds(arg);
                    if (time != null && time >= 0) {
                        //time argument
                        lockoutTime = time;
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
                        lockoutList.push(overrideArgs);
                    }

                }
            }
            
            if (lockoutList.length > 0) {
                const lockoutListString = lockoutList.join(',');
                logger.log(`Lock Cams - ${user}(${lockoutTime}s): ${lockoutListString}`);
                let now = new Date();
                const userGroup = config.groupMemberships[user];
                const accessLevel = config.newGroupsToOldMapping[userGroup];
                for (let cam of lockoutList) {
                    database.lockoutCams[cam] = { user: user, accessLevel, locked: true, duration: lockoutTime, timestamp: now };
                }
            }
        }
    }
}
