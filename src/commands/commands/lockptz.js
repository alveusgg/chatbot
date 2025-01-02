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
        name: 'lockptz',
        aliases: [
            "lockptzcam",
            "lockcamptz",
            "ptzlock"
        ],
        enabled: !!database,
        permission: {
            group: 'operator'
        },
        run: async ({ user, args }) => {
            // Remove command name from args
            args.shift();
            
            let lockoutPTZList = [];
            let lockoutPTZTime = 0;
            for (let arg of args) {
                if (arg != null && arg != "") {
                    //get lock duration if exists
                    let time = helper.formatTimestampToSeconds(arg);
                    if (time != null && time >= 0) {
                        //time argument
                        lockoutPTZTime = time;
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
                        lockoutPTZList.push(overrideArgs);
                    }

                }
            }

            if (lockoutPTZList.length > 0) {
                const lockoutListString = lockoutPTZList.join(',');
                logger.log(`Lock Cams - ${user}(${lockoutPTZTime}s): ${lockoutListString}`);
                let now = new Date();
                const userGroup = config.groupMemberships[user];
                const accessLevel = config.newGroupsToOldMapping[userGroup];
                for (let cam of lockoutPTZList) {
                    database.lockoutPTZ[cam] = { user, accessLevel, locked: true, duration: lockoutPTZTime, timestamp: now };
                }
            }
        }
    }
}
