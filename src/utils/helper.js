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
                for (const priority of config.userPermissions.commandPriority){
                    let userRank = getUserRank(userProfile);
                    if (config.userPermissions[priority].includes(userProfile.userName.toLowerCase())){
                        return {allowed:true,accessLevel:priority};
                    } else if (config.userPermissions[priority].includes("mods") && userRank >= 4){
                        return {allowed:true,accessLevel:priority};
                    } else if (config.userPermissions[priority].includes("vips") && userRank >= 3){
                        return {allowed:true,accessLevel:priority};
                    } else if (config.userPermissions[priority].includes("subs") && userRank >= 2){
                        return {allowed:true,accessLevel:priority};
                    } else if (config.userPermissions[priority].includes("all")){
                        return {allowed:true,accessLevel:priority};
                    } 
                    if (priority == permission){
                        //stop when priority rank reached
                        break;
                    }
                }
            }
        }
    }
    return {allowed:false,accessLevel:null};
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
}