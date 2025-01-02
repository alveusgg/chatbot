const path = require("path");
const config = require(path.join(__dirname, "../config/config.js"));

//---------- Helper Functions -----------------------------------------------
function commandCheck(message){
    message = message.trim();
    //only use first word
    message = message.split(" ")[0] || message;
    if (!message.startsWith(config.commandPrefix)){
        //not command
        return null;
    }
    message = message.replace(config.commandPrefix,"");
    message = message.toLowerCase();
    let convertedAlias = config.commandAliasConverted[message];
    if (convertedAlias != null){
        message = convertedAlias;
    }
    if (config.commandList.includes(message)){
        return message;
    }
    return null;
}

function isAllowed(userCommand,userProfile){
    //user = {name,isMod,isVip,isSub};
    userCommand = userCommand || "";
    for (const permission in config.commandPermissions){
        //go through all commands
        for (const command of config.commandPermissions[permission]){
            //see if in correct category
            if (userCommand.toLowerCase() == command.toLowerCase()){
                //go through ranks to check if user is allowed
                //commandPriority: ["commandAdmins", "commandSuperUsers", "commandMods", "commandOperator", "commandVips", "commandUsers"],
                for (const priority of config.userPermissions.commandPriority){
                    let userRank = getUserRank(userProfile);
                    if (config.userPermissions[priority].includes(userProfile.userName.toLowerCase())){
                        return {user:userProfile.userName.toLowerCase(),allowed:true,accessLevel:priority, userRank};
                    } else if (config.userPermissions[priority].includes(config.userRanks.mods) && userRank >= 4){
                        return {user:userProfile.userName.toLowerCase(),allowed:true,accessLevel:priority, userRank};
                    } else if (config.userPermissions[priority].includes(config.userRanks.vips) && userRank >= 3){
                        return {user:userProfile.userName.toLowerCase(),allowed:true,accessLevel:priority, userRank};
                    } else if (config.userPermissions[priority].includes(config.userRanks.subs) && userRank >= 2){
                        return {user:userProfile.userName.toLowerCase(),allowed:true,accessLevel:priority, userRank};
                    } else if (config.userPermissions[priority].includes(config.userRanks.all)){
                        return {user:userProfile.userName.toLowerCase(),allowed:true,accessLevel:priority, userRank};
                    } 
                    if (priority == permission){
                        //stop when priority rank reached
                        break;
                    }
                }
            }
        }
    }
    return {user:userProfile.userName.toLowerCase(),allowed:false,accessLevel:null, userRank:0};
}

function getUserRank(userProfile){
    let userRank = 0; //0-5, pleb,founder,sub,vip,mod,broadcaster
    if (userProfile.isBroadcaster){
        userRank = 5;
    } else if (userProfile.isMod){
        userRank = 4;
    } else if (userProfile.isVip){
        userRank = 3;
    } else if (userProfile.isSubscriber){
        userRank = 2;
    } else if (userProfile.isFounder){
        userRank = 1;
    }
    return userRank;
}

/**
 * @param {string} input 
 * @returns {string}
 */
function cleanName(input){
    let newInput = input;
    try{
        newInput = newInput.toLowerCase();
        newInput = newInput.replaceAll(/e?s(\s|\W|$|multi(?:cam)?|cam|outdoor|indoor|inside|wideangle|corner|den)/g, "$1");
        newInput = newInput.replaceAll(/(?:full)?cams?/g, "");
        newInput = newInput.replaceAll(" ", "");
        return newInput;
    } catch(e){
        console.log(`Failed to condense input (${input}): `,e);
    }
    return input;
}

function formatTimestampToSeconds(timeStamp) {
    var timeInSeconds = null;
    let match = timeStamp.match(/^\W*[0-9]+(hours|hour|hr|h)?\W*[0-9]*(minutes|minute|mins|min|m)?\W*[0-9]*(seconds|second|sec|s)?/g);
    if (match?.toString() == timeStamp) {
        timeStamp.replace(/hours|hour|hr|h/ig, "h");
        timeStamp.replace(/minutes|minute|min|m/ig, "m");
        timeStamp.replace(/seconds|second|sec|s/ig, "s");
        timeStamp.replace(/([0-9]+)[h|m|s]/ig, function (match, value) {
            if (match.indexOf("h") > -1) {
                timeInSeconds += value * 60 * 60;
            } else if (match.indexOf("m") > -1) {
                timeInSeconds += value * 60;
            } else if (match.indexOf("s") > -1) {
                timeInSeconds += value * 1;
            }
        });
    }
    return timeInSeconds;
}

/**
 * Takes all functions/objects from |sourceScope|
 * and adds them to |targetScope|.
 */
function importAll(sourceScope, targetScope) {
	for (let name in sourceScope) {
		targetScope[name] = sourceScope[name];
	}
}

module.exports = {
    commandCheck,
	isAllowed,
    importAll,
    cleanName,
    formatTimestampToSeconds
}