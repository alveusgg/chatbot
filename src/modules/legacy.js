const UtilsModule = require("../utils/utilsModule");
const config = require("../config/config");
const helper = require("../utils/helper");
const Logger = require("../utils/logger");

const logger = new Logger("modules/legacy");

let roamTimeout = null;
/**
 * Legacy controller implementation, handling scene changes and Twitch chat commands
 *
 * @param {import("../controller")} controller
 */
const main = async controller => {
	// Bind event handlers
	if (controller.connections.obs?.local) {
		controller.connections.obs.local.sceneChange(onSceneChange.bind(null, controller));
	} else {
		logger.warn("Local OBS connection not found. Scene changes will not be handled.");
	}

	if (controller.connections.obs?.cloud) {
		controller.connections.obs.cloud.sceneChange(onSceneChangeCloud.bind(null, controller));
	} else {
		logger.warn("Cloud OBS connection not found. Scene changes will not be handled.");
	}

	if (controller.connections.twitch) {
		controller.connections.twitch.onMessage(onTwitchMessage.bind(null, controller));
	} else {
		logger.warn("Twitch connection not found. Twitch chat messages will not be handled.");
	}

	// Log the current scene in OBS
	const currentScene = helper.cleanName(controller.connections.obs?.local?.currentScene || "");
	logger.log("Starting up... Current scene:", currentScene);

	// Restore PTZ roaming status
	if (controller.connections.database?.[currentScene]?.isRoaming) {
		clearTimeout(roamTimeout);
		setPTZRoamMode(controller, currentScene);
	}

	runAtSpecificTimeOfDay(config.restrictedHours.start-1, 55, () => {
		try {
			logger.log(`Timer (9:55am) - Send !nightcams !mute fox`);
			controller.connections.twitch.send("alveusgg", `!nightcams`);
			controller.connections.obs.local.setMute(config.sceneAudioSource["fox"], true);
			switchToCustomCams(controller, "alveusgg", { allowed: true, accessLevel: 'commandAdmins' }, "customcamsbig", config.customCamCommandMapping["nightcams"]);
		} catch (e) {
			logger.log(`Error: Failed to run timer - ${e}`);
		}
	});

	// for (let hour = 1; hour < 5; hour++) {
	// 	for (let min = 0; min < 60; min += 10) {
	// 		runAtSpecificTimeOfDay(hour, min, () => {
	// 			try {
	// 				logger.log(`Running Commerical ${hour}:${min}`);
	// 				controller.connections.twitch.runCommercial(config.alveusTwitchID, 180);
	// 			} catch (e) {
	// 				logger.log(`Error: Failed to run commerical - ${e}`);
	// 			}
	// 		});
	// 	}
	// }
}

module.exports = main;

/**
 * Handle local OBS scene changes
 *
 * @param {import("../controller")} controller
 * @param {string} name
 * @param {string} oldName
 * @returns {Promise<void>}
 */
const onSceneChange = async (controller, name, oldName) => {
	logger.log(`Scene Change from ${oldName} to ${name}`);

	let newScene = name ?? "";
	newScene = newScene.replaceAll(" ", "");
	newScene = newScene.toLowerCase();

	let oldScene = oldName ?? "";
	oldScene = oldScene.replaceAll(" ", "");
	oldScene = oldScene.toLowerCase();

	//do nothing if not live, cloud server not live, in studio mode, cloud server not on Alveus Server
	let processChange = false;
	let cloudLive = await controller.connections.obs.cloud.isLive() || false;
	if (cloudLive) {
		let currentCloudScene = await controller.connections.obs.cloud.getScene() || "";
		//logger.log("localserver change, currentcloud: ",currentCloudScene)
		if (currentCloudScene == "Alveus Server") {
			let localLive = await controller.connections.obs.local.isLive() || false;
			if (localLive) {
				let localStudioMode = await controller.connections.obs.local.isStudioMode() || false;
				if (!localStudioMode) {
					processChange = true;
				}
			}
		}
	}
	if (!processChange) {
		//do nothing
		return;
	}

	//Clear CustomCam list if changed
	// if (oldScene == "customcams") {
	// 	clearCustomCamsDB(controller);
	// }

	//Mute Global music if changing to any other scene
	if (newScene != "customcams") {
		//controller.connections.obs.local.setMute(config.globalMusicSource, true);
	}

	if (!config.pauseNotify) {
		let now = new Date();
		// var minutes = now.getUTCMinutes();
		var hour = now.getUTCHours();
		//logger.log("scene change current time",hour,now);
		//if ((hour >= 19 && minutes >= 30) || hour >= 20 || hour < 8){
		if ( hour >= config.notifyHours.start && hour < config.notifyHours.end ) {
			let continueCheck = true;

			if (newScene == "customcam" || oldScene == "customcam") {
				//don't notify
				continueCheck = false;
			}

			let onewayList = config.onewayNotifications[oldScene];
			if (onewayList != null) {
				//check if leaving multiscene, allow child scenes.
				for (let i = 0; i < onewayList.length; i++) {
					let sceneName = onewayList[i] || "";
					sceneName = helper.cleanName(sceneName);
					if (newScene == sceneName) {
						//don't notify
						continueCheck = false;
					}
				}
			}
			if (continueCheck) {
				logger.log("Notify: Not oneway");
				//Multiscene disable notification
				let newSceneIsMulti = false;
				let oldSceneIsMulti = false;
				for (let multiScene in config.multiScenes) {
					let sceneList = config.multiScenes[multiScene];
					//check if this is a multiscene and find parent camera
					for (let i = 0; i < sceneList.length; i++) {
						let sceneName = sceneList[i] || "";
						sceneName = helper.cleanName(sceneName);
						if (newScene == sceneName) {
							//found match
							newSceneIsMulti = true;
						} else if (oldScene == sceneName) {
							//found match
							oldSceneIsMulti = true;
						}
					}
				}
				if (newSceneIsMulti && oldSceneIsMulti) {
					//if both scenes are part of multiscene, do not notify
					continueCheck = false;
				}
			}

			//keep checking if not multiscene
			if (continueCheck) {
				logger.log("Notify: Not multiScenes", config.notifyScenes, newScene, oldScene);
				let foundNewName = false;
				let foundOldName = false;
				for (let i = 0; i < config.notifyScenes.length; i++) {
					let notifySceneName = config.notifyScenes[i] ?? "";
					notifySceneName = notifySceneName.replaceAll(" ", "");
					notifySceneName = notifySceneName.toLowerCase();
					if (newScene == notifySceneName) {
						foundNewName = true;
						break;
					} else if (oldScene == notifySceneName) {
						foundOldName = true;
						break;
					}
				}
				let timestamp = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
				if (foundNewName) {
					//notify its on
					logger.log("Sending Notification newName. From: ", oldName, "to", name);
					controller.connections.courier.sendListNotificationDiscord("livecamalert", "LivecamAlerts", `${name} Active`, `Livecam Switched to ${name}`, [{ name: "Time", value: timestamp }]);
				} else if (foundOldName) {
					//notify its off
					logger.log("Sending Notification Oldname. From: ", oldName, "to", name);
					controller.connections.courier.sendListNotificationDiscord("livecamalert", "LivecamAlerts", `${oldName} No Longer Active`, `Livecam Switched to ${name}`, [{ name: "Time", value: timestamp }]);
				}
			}
		}
	}

	if (!config.pauseGameChange) {
		let justChattingCams = ["Backpack", "Backpack Server", "Alveus PC", "Nuthouse"];
		let poolsCam = []; //["Georgie"];

		//Alveus Ambassador 24/7 Live Cam | NEW Holiday Sweater !merch | !alveus !hat !vid
		//lastStreamInfo = await controller.connections.twitch.getStreamInfo(config.alveusTwitchID);
		//logger.log("Twitch Info: ",lastStreamInfo.title," game: ",lastStreamInfo.gameName," gameid: ",lastStreamInfo.gameId);

		if (justChattingCams.includes(name)) {
			await controller.connections.twitch.setStreamInfo(config.alveusTwitchID, null, "chatting");
		} else if (poolsCam.includes(name)) {
			await controller.connections.twitch.setStreamInfo(config.alveusTwitchID, null, "pools");
		} else {
			await controller.connections.twitch.setStreamInfo(config.alveusTwitchID, null, "animals");
		}
	}

	//Create Twitch Vod Markers
	if (!config.pauseTwitchMarker) {
		let markerCams = ["Nuthouse"]; //"Backpack", "Backpack Server", "Alveus PC",

		if (markerCams.includes(name)) {
			//new swap
			let marker = await controller.connections.twitch.createMarker(config.alveusTwitchID, `Livecam Switched to ${name}`);
			logger.log("Marker Created: ", marker.creationDate, marker.description, marker.id, marker.positionInSeconds);
		} else if (markerCams.includes(oldName)) {
			//ending swap
			let marker = await controller.connections.twitch.createMarker(config.alveusTwitchID, `Livecam Switched to ${name}`);
			logger.log("Marker Created: ", marker.creationDate, marker.description, marker.id, marker.positionInSeconds);
		}
	}

	//Announce Alveus Server Changes to Twitch Chat
	if (config.announceChatSceneChange) {
		let message = `Scene Changed to ${name}`;
		controller.connections.twitch.send("alveussanctuary", message);
	}
}

/**
 * Handle cloud OBS scene changes
 *
 * @param {import("../controller")} controller
 * @param {string} name
 * @param {string} oldName
 * @returns {Promise<void>}
 */
const onSceneChangeCloud = async (controller, name, oldName) => {
	logger.log(`Cloud Scene Change from ${oldName} to ${name}`);

	//do nothing if not live, cloud server not live, in studio mode, cloud server not on Alveus Server
	let processChange = false;
	let cloudLive = await controller.connections.obs.cloud.isLive() || false;
	if (cloudLive) {
		let cloudStudioMode = await controller.connections.obs.cloud.isStudioMode() || false;
		if (!cloudStudioMode) {
			if (name != "Alveus Server") {
				processChange = true;
			}
		}
	}
	if (!processChange) {
		//do nothing
		return;
	}

	if (!config.pauseGameChange) {

		//Alveus Ambassador 24/7 Live Cam | NEW Holiday Sweater !merch | !alveus !hat !vid
		//lastStreamInfo = await controller.connections.twitch.getStreamInfo(config.alveusTwitchID);
		//logger.log("Twitch Info: ",lastStreamInfo.title," game: ",lastStreamInfo.gameName," gameid: ",lastStreamInfo.gameId);

		// let notJustChatting = [];
		// if (notJustChatting.includes(name)) {
		// 	// await controller.connections.twitch.setStreamInfo(config.alveusTwitchID,null,"Just Chatting");
		// } else {
		// 	await controller.connections.twitch.setStreamInfo(config.alveusTwitchID, null, "Just Chatting");
		// }
	}

	if (!config.pauseTwitchMarker) {
		let markerCams = ["RTMP_Source", "Maya LiveU", "Alveus PC"];

		if (markerCams.includes(name)) {
			//new swap
			let marker = await controller.connections.twitch.createMarker(config.alveusTwitchID, `Livecam Switched to ${name}`);
			logger.log("Marker Created: ", marker.creationDate, marker.description, marker.id, marker.positionInSeconds);
		} else if (markerCams.includes(oldName)) {
			//ending swap
			let marker = await controller.connections.twitch.createMarker(config.alveusTwitchID, `Livecam Switched to ${name}`);
			logger.log("Marker Created: ", marker.creationDate, marker.description, marker.id, marker.positionInSeconds);
		}
	}

	//Announce Alveus Server Changes to Twitch Chat
	if (config.announceChatSceneChange) {
		let message = `Cloud Scene Changed to ${name}`;
		controller.connections.twitch.send("alveussanctuary", message);
	}
}

/**
 * Handle incoming Twitch chat messages
 *
 * @param {import("../controller")} controller
 * @param {string} channel
 * @param {Object} user
 * @param {string} message
 * @param {Object} tags
 * @returns {Promise<void>}
 */
const onTwitchMessage = async (controller, channel, user, message, tags) => {
	message = message.trim();

	// logger.log("Message",message);

	//check if blacklisted from commands
	if (config.userBlacklist.includes(user.toLowerCase())) {
		return;
	}

	//check if command and return without prefix
	let userCommand = helper.commandCheck(message);
	if (userCommand == null) {
		//not a command
		return;
	}

	// logger.log("userCommand", userCommand)

	let accessProfile = helper.isAllowed(userCommand, tags.userInfo);
	if (accessProfile == null || !accessProfile.allowed) {
		//no permission
		// logger.log("NOT valid user",user,userCommand);
		return;
	}
	//logger.log("valid user",user,userCommand,config.commandScenes[userCommand],accessProfile);

	// //check Throttled
	// if (config.throttledCommands.includes(userCommand)){
	// 	let now = new Date();
	// 	let before = timeSinceThrottled[userCommand];
	// 	let differenceMS = now.getTime() - timeSinceThrottled.getTime();
	// 	if (differenceMS < config.throttleCommandLength){
	// 		return;
	// 	}
	// }
	
	let currentScene = controller.connections.obs.local.currentScene || "";
	currentScene = helper.cleanName(currentScene);

	let parameters = { controller, userCommand, accessProfile, channel, message, currentScene }
	//check if scene command
	try {
		let cloudSceneCommand = await checkLocalSceneCommand(...Object.values(parameters));
		let serverSceneCommand = await checkServerSceneCommand(...Object.values(parameters));
		if (cloudSceneCommand || serverSceneCommand) {
			//finished processing scene command
			return;
		}

		//Check time restricted access
		let hasAccess = checkTimeAccess(...Object.values(parameters));
		if (!hasAccess) {
			//time restricted command
			controller.connections.twitch.send(channel, `Time restricted command`);
			return
		}

		

		//logger.log("current scene",currentScene);

		/*
		let customSceneCommand = await checkCustomSceneCommand(controller, userCommand, accessProfile, channel, message, currentScene);
		let ptzCommand = await checkPTZCommand(controller, userCommand, accessProfile, channel, message, currentScene);
		let nuthouseCommand = await checkNuthouseCommand(controller, userCommand, accessProfile, channel, message, currentScene);
		let customcamCommand = await checkCustomCamCommand(controller, userCommand, accessProfile, channel, message, currentScene);
		let extraCommand = await checkExtraCommand(controller, userCommand, accessProfile, channel, message, currentScene);
		let unifiCommand = await checkUnifiCommand(controller, userCommand, accessProfile, channel, message, currentScene);
		*/
		let valid = await checkCustomSceneCommand(...Object.values(parameters)) ||
			await checkPTZCommand(...Object.values(parameters)) ||
			await checkNuthouseCommand(...Object.values(parameters)) ||
			await checkCustomCamCommand(...Object.values(parameters)) ||
			await checkExtraCommand(...Object.values(parameters)) ||
			await checkUnifiCommand(...Object.values(parameters))
		return valid;
	} catch (error) {
		logger.log(`Error checking command: ${userCommand}`, error);
	}
}

//Check if Time Restricted Command
function checkTimeAccess(controller, userCommand, accessProfile, channel, message, currentScene)  {
	let hasAccess = false;

	if (controller.connections.database.timeRestrictionDisabled == true) {
		return true;
	}
	message = message || "";
	let messageArgs = message.split(" ");
	let arg1 = messageArgs[1] ?? "";
	arg1 = arg1.trim().toLowerCase();
	if (arg1 == "music"){
		return true;
	}
	//specific mod time restrictions
	if (config.timeRestrictedCommands.includes(userCommand)) {
		//check if Admin
		if (config.userPermissions.commandPriority[0] == accessProfile.accessLevel) {
			hasAccess = true;
			//check if super user
		} else if (config.userPermissions.commandPriority[1] == accessProfile.accessLevel) {
			hasAccess = true;
		}
		//not directly allowed
		if (!hasAccess) {
			//check time
			let now = new Date();
			// var minutes = now.getUTCMinutes();
			var hour = now.getUTCHours();
			// console.log("check time",now,hour,config.restrictedHours);
			if (hour >= config.restrictedHours.start && hour < config.restrictedHours.end) {
				//restricted time
				hasAccess = false;
			} else {
				//allow access to mods
				hasAccess = true;
			}
		}
	} else {
		hasAccess = true;
	}
	return hasAccess;
}

async function checkLocalSceneCommand(controller, userCommand, accessProfile, channel, message, currentScene)  {
	let sceneCommand = false;

	if (
		config.commandScenes[userCommand] != null &&
		config.commandScenes[userCommand] !== ""
	) {
		let hasAccess = false;
		//specific mod time restrictions
		hasAccess = checkTimeAccess(controller, userCommand, accessProfile);

		//MultiCommand swapping
		if (!hasAccess) {
			let currentScene = await controller.connections.obs.local.getScene() || "";
			currentScene = helper.cleanName(currentScene);

			for (const baseCommand in config.multiCommands) {
				let fullList = config.multiCommands[baseCommand] || [];
				//find usercommand in MultiCommands
				if (fullList.includes(userCommand)) {
					//get Scene names for matching Command
					let fullSceneList = config.multiScenes[baseCommand] || [];
					for (let i = 0; i < fullSceneList.length; i++) {
						let scene = fullSceneList[i] || "";
						scene = helper.cleanName(scene);
						//check if current scene is in current commands Multiscenes
						if (scene != "" && currentScene == scene) {
							hasAccess = true;
							break;
						}
					}
				}
			}

			//One Direction Swapping (if on scene, allow subscene)
			let onWayList = config.onewayCommands[currentScene] || null;
			if (onWayList != null) {
				if (onWayList.includes(userCommand)) {
					hasAccess = true;
				}
			}
		}

		if (hasAccess) {
			await controller.connections.obs.local.setScene(config.commandScenes[userCommand]);
			sceneCommand = true;

			// if (userCommand == "hankcam2" && !controller.connections.database["hankIR"].status) {
			// 	//enable ir
			// 	controller.connections.cameras["hankcorner"].enableIR();
			// 	controller.connections.database["hankIR"] = { status: true, time: now() };
			// } else if (userCommand != "hankcam2" && controller.connections.database["hankIR"].status) {
			// 	controller.connections.cameras["hankcorner"].disableIR();
			// 	controller.connections.database["hankIR"] = {status:false,time:null};
			// }

			//Clear CustomCam list if changed
			// if (userCommand != "customcams") {
			// 	clearCustomCamsDB(controller);
			// }
		}
	}
	return sceneCommand;
}

async function checkServerSceneCommand(controller, userCommand, accessProfile, channel, message, currentScene)  {
	let sceneCommand = false;

	if (config.pauseCloudSceneChange) {
		return false;
	}

	//check if cloud scene command
	if (
		config.commandScenesCloud[userCommand] != null &&
		config.commandScenesCloud[userCommand] !== ""
	) {
		let hasAccess = checkTimeAccess(controller, userCommand, accessProfile);
		if (hasAccess) {
			setTimeout(() => {
				controller.connections.obs.cloud.setScene(config.commandScenesCloud[userCommand]);
			}, 500)
			sceneCommand = true;
		}
	}
	return sceneCommand;
}

async function checkCustomSceneCommand(controller, userCommand, accessProfile, channel, message, currentScene) {

	userCommand = userCommand || "";
	userCommand = userCommand.toLowerCase();
	let fullArgs = userCommand;
	if (!config.customSceneCommands.includes(userCommand)) {
		return;
	}

	userCommand = helper.cleanName(userCommand);
	let overrideArgs = config.customCommandAlias[userCommand];
	if (overrideArgs != null) {
		fullArgs = overrideArgs;
	}
	switchToCustomCams(controller, channel, accessProfile, "customcamsbig", fullArgs)
	return true;
}

async function checkPTZCommand(controller, userCommand, accessProfile, channel, message, currentScene) {
	//check if PTZ command
	if (!userCommand.startsWith(config.ptzPrefix)) {
		return false;
	}

	let messageArgs = message.split(" ");

	let arg1 = messageArgs[1] ?? "";
	let arg2 = messageArgs[2] ?? "";
	let arg3 = messageArgs[3] ?? "";
	let arg4 = messageArgs[4] ?? "";
	let arg5 = messageArgs[5] ?? "";
	
	let specificCamera = "";
	let ptzcamName = helper.cleanName(arg1);
	//convert to clean base command
	let baseName = config.customCommandAlias[ptzcamName] ?? ptzcamName;
	//convert to axis camera name
	ptzcamName = config.axisCameraCommandMapping[baseName] ?? baseName;

	//console.log("ptzcommand",userCommand,currentScene,"base",baseName,"cam",ptzcamName);


	if (controller.connections.cameras[ptzcamName] != null) {
		specificCamera = ptzcamName;
		currentScene = ptzcamName;
		arg1 = messageArgs[2] ?? "";
		arg2 = messageArgs[3] ?? "";
		arg3 = messageArgs[4] ?? "";
		arg4 = messageArgs[5] ?? "";
		arg5 = messageArgs[6] ?? "";
		//remove camera argument
		messageArgs.splice(0, 1);
	} else {
		//didnt add a specific modifier
		if (currentScene == "custom") {
			let currentCamList = controller.connections.database["customcam"];
			let firstScene = currentCamList[0] ?? "";
			//remove fullcam
			let cleanFirstScene = helper.cleanName(firstScene) ?? "";
			ptzcamName = config.axisCameraCommandMapping[cleanFirstScene] ?? cleanFirstScene;
			if (controller.connections.cameras[ptzcamName] != null) {
				specificCamera = ptzcamName;
				currentScene = ptzcamName;
			}
		}
	}

	// logger.log("ptzcommand converted","currentscene",currentScene,"specificCamera",specificCamera);
	arg1 = arg1.trim().toLowerCase();
	arg2 = arg2.trim().toLowerCase();
	arg3 = arg3.trim().toLowerCase();
	arg4 = arg4.trim().toLowerCase();
	arg5 = arg5.trim().toLowerCase();

	let currentCamList = controller.connections.database["customcam"];
	let camera = controller.connections.cameras[currentScene] || null;
	if (camera == null) {
		//multiscene/extra scene
		let parentScene = "";
		for (let multiScene in config.multiScenes) {
			let sceneList = config.multiScenes[multiScene];
			//check if this is a multiscene and find parent camera
			for (let i = 0; i < sceneList.length; i++) {
				let sceneName = sceneList[i] || "";
				sceneName = helper.cleanName(sceneName);
				if (currentScene == sceneName) {
					//found match
					parentScene = multiScene;
					break;
				}
			}
			if (parentScene != "") {
				break;
			}
		}
		//set currentscene and camera to parent
		if (parentScene != "") {
			currentScene = helper.cleanName(parentScene);
			camera = controller.connections.cameras[currentScene] || null;
		}
	}

	//cant find camera client
        if (camera == null && !(userCommand.includes("ptzdraw") || userCommand.includes("ptzclick"))) {
		return false;
	}

	//disable specific camera movement
	// if (ptzcamName == "pasture"){
	// 	return false;
	// }

	controller.connections.database[currentScene] = controller.connections.database[currentScene] || {};
	controller.connections.database[currentScene].presets = controller.connections.database[currentScene].presets || {};

	//roamstatus
	//roamlist
	//speed

	//Doing Any PTZ Command disables roaming
	if (userCommand != "ptzroaminfo") {
		controller.connections.database[currentScene].isRoaming = false;
	}

	switch (userCommand) {
		case "ptzpan":
			// logger.log('ptzpan',arg1);
			camera.panCamera(arg1);
			camera.enableAutoFocus();
			break;
		case "ptztilt":
			camera.tiltCamera(arg1);
			camera.enableAutoFocus();
			break;
		case "ptzzoom":
			let zscaledAmount = arg1 * 100 || 0;
			camera.zoomCamera(zscaledAmount);
			camera.enableAutoFocus();
			break;
		case "ptzfocus":
			if (arg1 == "on" || arg1 == "yes") {
				camera.enableAutoFocus();
			} else if (arg1 == "off" || arg1 == "no") {
				camera.disableAutoFocus();
			} else {
				let fscaledAmount = arg1 * 50 || 0;
				camera.focusCameraExact(fscaledAmount);
			}
			break;
		case "ptzfocusr":
			if (arg1 == "on" || arg1 == "yes") {
				camera.enableAutoFocus();
			} else if (arg1 == "off" || arg1 == "no") {
				camera.disableAutoFocus();
			} else {
				let fscaledAmount = arg1 * 50 || 0;
				camera.focusCamera(fscaledAmount);
			}
			break;
		case "ptzautofocus":
			if (arg1 == "1" || arg1 == "on" || arg1 == "yes") {
				camera.enableAutoFocus();
			} else if (arg1 == "off" || arg1 == "0" || arg1 == "no") {
				camera.disableAutoFocus();
			}
			break;
		case "ptztracking":
			if (arg1 == "1" || arg1 == "on" || arg1 == "yes") {
				camera.enableAutoTracking();
				camera.enableAutoFocus();
			} else if (arg1 == "off" || arg1 == "0" || arg1 == "no") {
				camera.disableAutoTracking();
				camera.enableAutoFocus();
			}
			break;
		case "ptzpreset":
			if (specificCamera != "") {
				//used camera name
				if (arg1 != "") {
					//2nd argument provided
					camera.goToPreset(arg1);
				} else {
					camera.goToPreset(specificCamera);
				}
			} else {
				camera.goToPreset(arg1);
			}
			camera.enableAutoFocus();
			break;
		case "ptzmove":
			camera.moveCamera(arg1);
			camera.enableAutoFocus();
			break;
		case "ptzspeed":
			camera.setSpeed(arg1);
			controller.connections.database[currentScene].speed = arg1;
			break;
		case "ptzcenter":
			//x-cord y-cord rzoom 
			camera.ptz({ center: `${arg1},${arg2}`, rzoom: arg3 });
			camera.enableAutoFocus();
			break;
		case "ptzareazoom":
			//x-cord y-cord zoom 
			camera.ptz({ areazoom: `${arg1},${arg2},${arg3}` });
			camera.enableAutoFocus();
			break;
		case "ptzclick":
                        // Use x and y coordinates to find the camera box the click occured in
                        let xcord = parseInt(arg1, 10);
                        let ycord = parseInt(arg2, 10);
                        const clickbox = findBox(xcord, ycord);
                        // Set the camera
                        camera = controller.connections.cameras[clickbox.ptzcamName];
                        await camera.ptz({ areazoom: `${Math.round(clickbox.x)},${Math.round(clickbox.y)},${Math.round(clickbox.zoom)}` });
                        await camera.enableAutoFocus();
                        controller.connections.twitch.send(controller, channel, `Clicked on ${ptzcamName}`);
                        break;
		case "ptzdraw":
                        // assign user inputs as integers.
                        let source_x = parseInt(arg1, 10);
                        let source_y = parseInt(arg2, 10); 
                        let source_rectwidth = parseInt(arg3, 10);
                        let source_rectheight = parseInt(arg4, 10);
                                
                        // calculate the x and y coordinates for the center of the rectangle.
                        let xdrawcord = source_x + source_rectwidth / 2;
                        let ydrawcord = source_y + source_rectheight / 2;
                        
                        // call findBox to determine which box the rectangle is in and assign the relevant camera.
                        const drawbox = findBox(xdrawcord, ydrawcord);
                        
                        //scale the rectangle to 1920x1080
                        let scaledRectWidth = source_rectwidth / drawbox.scaleX;
                        let scaledRectHeight = source_rectheight / drawbox.scaleY;

                        let zoomWidth = drawbox.sourceWidth / scaledRectWidth;
                        let zoomHeight = drawbox.sourceHeight / scaledRectHeight;
                        let zoom = Math.floor(Math.min(zoomWidth, zoomHeight) * 100);

                        // Set the camera
                        camera = controller.connections.cameras[drawbox.ptzcamName];
                        await camera.ptz({ areazoom: `${Math.round(drawbox.x)},${Math.round(drawbox.y)},${Math.round(zoom)}` });
                        await camera.enableAutoFocus();
                        controller.connections.twitch.send(controller, channel, `Clicked on ${ptzcamName}`);
                        break;
		case "ptzset":
			//pan tilt zoom relative pos
			camera.ptz({ rpan: arg1, rtilt: arg2, rzoom: arg3 * 100, autofocus: "on" });
			break;
		case "ptzseta":
			//absolute pos, pan tilt zoom autofocus focus 
			let customPtz = { pan: arg1};

			let customTilt = parseFloat(arg2);
			if (!isNaN(customTilt)) {
				customPtz.tilt = customTilt;
			}

			let customZoom = parseInt(arg3);
			if (!isNaN(customZoom)) {
				customPtz.zoom = customZoom;
			}

			let customAF = arg4;
			if (arg4 == "1" || arg4 == "on" || arg4 == "yes") {
				customAF = "on";
			} else if (arg4 == "off" || arg4 == "0" || arg4 == "no") {
				customAF = "off";
			} else {
				customAF = "on";
			}
			customPtz.autofocus = customAF;

			let customFocus = parseInt(arg5);
			if (!isNaN(customFocus)) {
				customPtz.focus = customFocus;
			}
			camera.ptz(customPtz);
			break;
		case "ptzgetinfo":
			let cpos = await camera.getPosition();
			if (cpos && cpos.pan != null) {
				controller.connections.twitch.send(channel, `PTZ Info (${currentScene}): ${cpos.pan}p |${cpos.tilt}t |${cpos.zoom}z |af ${cpos.autofocus || "n/a"} |${cpos.focus || "n/a"}f`);
			} else {
				logger.log("Failed to get ptz position");
			}
			break;
		case "ptzspin":
			camera.continousPanTilt(arg1, arg2, arg3);
			break;
		case "ptzstop":
			camera.continousPanTilt(0, 0);
			break;
		case "ptzdry":
			camera.speedDry();
			break;
		case "ptzir":
			if (arg1 == "1" || arg1 == "on" || arg1 == "yes") {
				camera.setIRCutFilter("off");
			} else if (arg1 == "off" || arg1 == "0" || arg1 == "no") {
				camera.setIRCutFilter("on");
			} else {
				camera.setIRCutFilter("auto");
			}
			break;
		case "ptzirlight":
			if (arg1 == "1" || arg1 == "on" || arg1 == "yes") {
				camera.enableIR();
			} else if (arg1 == "off" || arg1 == "0" || arg1 == "no") {
				camera.disableIR();
			} else {
				camera.disableIR();
			}
			break;
		case "ptzsave":
			let currentPosition = await camera.getPosition();
			if (currentPosition && currentPosition.pan != null) {
				if (specificCamera != "") {
					//used camera name
					if (arg1 != "") {
						//2nd argument provided
						controller.connections.database[specificCamera].presets[arg1] = currentPosition;
					} else {
						controller.connections.database[currentScene].presets[specificCamera] = currentPosition;
					}
				} else {
					if (arg1 != "") {
						//save named preset
						controller.connections.database[currentScene].presets[arg1] = currentPosition;
					} else {
						controller.connections.database[currentScene].lastKnownPosition = currentPosition;
					}
				}

			} else {
				logger.log("Failed to get ptz position");
			}
			break;
		case "ptzhomeold":
			camera.goHome();
			camera.enableAutoFocus();
			break;
		case "ptzhome":
		case "ptzload":
			if (userCommand == "ptzhome"){
				arg1 = "home";
			}
			if (arg2 == "all"){
				for (let cam of currentCamList){
					let preset = controller.connections.database[cam].presets["home"];
					if (preset != null) {
						camera.ptz({ pan: preset.pan, tilt: preset.tilt, zoom: preset.zoom, focus: preset.focus, autofocus: preset.autofocus });
					} 
				}
			} else if (specificCamera != "") {
				//used camera name
				if (arg1 != "") {
					//2nd argument provided
					let preset = controller.connections.database[specificCamera].presets[arg1];
					if (preset != null) {
						camera.ptz({ pan: preset.pan, tilt: preset.tilt, zoom: preset.zoom, focus: preset.focus, autofocus: preset.autofocus });
					} else if (controller.connections.database[specificCamera].lastKnownPosition != null) {
						let previous = controller.connections.database[specificCamera].lastKnownPosition;
						camera.ptz({ pan: previous.pan, tilt: previous.tilt, zoom: previous.zoom });
					}

				} else {
					let preset = controller.connections.database[currentScene].presets[specificCamera];
					if (preset != null) {
						camera.ptz({ pan: preset.pan, tilt: preset.tilt, zoom: preset.zoom, focus: preset.focus, autofocus: preset.autofocus });
					} else if (controller.connections.database[currentScene].lastKnownPosition != null) {
						let previous = controller.connections.database[currentScene].lastKnownPosition;
						camera.ptz({ pan: previous.pan, tilt: previous.tilt, zoom: previous.zoom });
					}
				}
			} else {
				let preset = controller.connections.database[currentScene].presets[arg1];
				if (preset != null) {
					camera.ptz({ pan: preset.pan, tilt: preset.tilt, zoom: preset.zoom, focus: preset.focus, autofocus: preset.autofocus });
				} else if (controller.connections.database[currentScene].lastKnownPosition != null) {
					let previous = controller.connections.database[currentScene].lastKnownPosition;
					camera.ptz({ pan: previous.pan, tilt: previous.tilt, zoom: previous.zoom });
				}
			}
			break;
		case "ptzremove":
			if (specificCamera != "") {
				//used camera name
				if (arg1 != "") {
					//2nd argument provided
					if (controller.connections.database[specificCamera].presets[arg1] != null) {
						let response = delete controller.connections.database[specificCamera].presets[arg1];
						if (response != true) {
							logger.log(`Failed to remove preset ${arg1}: ${response} ${controller.connections.database[specificCamera]}`);
						}
					}
				} else {
					controller.connections.database[currentScene].presets[specificCamera] = currentPosition;
				}
			} else {
				if (controller.connections.database[currentScene].presets[arg1] != null) {
					let response = delete controller.connections.database[currentScene].presets[arg1];
					if (response != true) {
						logger.log(`Failed to remove preset ${arg1}: ${response} ${controller.connections.database[currentScene]}`);
					}
				}
			}
			break;
		case "ptzrename":
			if (specificCamera != "") {
				//used camera name
				if (arg1 != "" && arg2 != "") {
					//2nd argument provided
					if (controller.connections.database[specificCamera].presets[arg1] != null) {
						controller.connections.database[specificCamera].presets[arg2] = controller.connections.database[specificCamera].presets[arg1];
						let response = delete controller.connections.database[specificCamera].presets[arg1];
						if (response != true) {
							logger.log(`Failed to remove preset ${arg1}: ${response} ${controller.connections.database[specificCamera]}`);
						}
					}
				} else {
					if (controller.connections.database[currentScene].presets[specificCamera] != null) {
						controller.connections.database[currentScene].presets[arg1] = controller.connections.database[currentScene].presets[specificCamera];
						let response = delete controller.connections.database[currentScene].presets[specificCamera];
						if (response != true) {
							logger.log(`Failed to remove preset ${specificCamera}: ${response} ${controller.connections.database[currentScene]}`);
						}
					}
				}
			} else {
				if (controller.connections.database[currentScene].presets[arg1] != null) {
					controller.connections.database[currentScene].presets[arg2] = controller.connections.database[currentScene].presets[arg1];
					let response = delete controller.connections.database[currentScene].presets[arg1];
					if (response != true) {
						logger.log(`Failed to remove preset ${arg1}: ${response} ${controller.connections.database[currentScene]}`);
					}
				}
			}
			break;
		case "ptzclear":
			if (specificCamera) {
				controller.connections.database[specificCamera].presets = {};
			} else {
				controller.connections.database[currentScene].presets = {};
			}
			break;
		case "ptzlist":
			if (specificCamera) {
				controller.connections.twitch.send(channel, `PTZ Presets: ${Object.keys(controller.connections.database[specificCamera].presets).sort().toString()}`)
			} else {
				controller.connections.twitch.send(channel, `PTZ Presets: ${Object.keys(controller.connections.database[currentScene].presets).sort().toString()}`)
			}

			break;
		case "ptzgetfocus":
			let pos = await camera.getPosition();
			let currentFocus = parseFloat(pos.focus);
			if (!isNaN(currentFocus)) {
				//is number
				try {
					currentFocus = currentFocus / 50;
					currentFocus.toFixed(2);
					controller.connections.twitch.send(channel, `PTZ Focus (0-200): ${currentFocus}`)
				} catch (e) {
					//logger.log("Error getting focus")
				}

			}
			break;
		case "ptzroam":
			let currentSpeed = await camera.getSpeed();
			if (messageArgs.length == 2 && (arg1 == "on" || arg1 == "1" || arg1 == "yes")) {
				//start roaming
				controller.connections.database[currentScene].isRoaming = true;
				if (currentSpeed != null) {
					controller.connections.database[currentScene].speed = currentSpeed;
				}
				clearTimeout(roamTimeout);
				setPTZRoamMode(controller, currentScene);
				break;
			} else if (messageArgs.length == 2 && (arg1 == "off" || arg1 == "0" || arg1 == "no")) {
				//stop roaming
				controller.connections.database[currentScene].isRoaming = false;
				break;
			} else if (messageArgs.length < 4) {
				//invalid command
				break;
			}
			//ptzroam on/off
			//ptzroam 10s 20 fence barn trailer
			//ptzroam 10 fence barn trailer
			//ptzroam fence barn trailer

			let startingListPos = 0;
			if (!isNaN(parseInt(arg1))) {
				//length of time
				controller.connections.database[currentScene].roamTime = arg1;
				startingListPos = 2;
			} else {
				//invalid command
				break;
			}
			if (!isNaN(parseFloat(arg2))) {
				//speed given
				controller.connections.database[currentScene].roamSpeed = arg2;
				startingListPos = 3;
			}
			let ptzRoamList = [];
			for (let i = startingListPos; i < messageArgs.length; i++) {
				let position = messageArgs[i];
				if (controller.connections.database[currentScene].presets[position] != null) {
					ptzRoamList.push(position);
				}
			}
			controller.connections.database[currentScene].roamIndex = -1;
			controller.connections.database[currentScene].roamDirection = "forward";
			controller.connections.database[currentScene].roamList = JSON.parse(JSON.stringify(ptzRoamList));
			controller.connections.database[currentScene].isRoaming = true;

			if (currentSpeed != null) {
				controller.connections.database[currentScene].speed = currentSpeed;
			}

			clearTimeout(roamTimeout);
			setPTZRoamMode(controller, currentScene);
			break;
		case "ptzroaminfo":
			try {
				let isEnabled = "Disabled";
				if (controller.connections.database[currentScene].isRoaming) {
					isEnabled = "Enabled";
				}
				controller.connections.twitch.send(channel, `PTZ Roam: ${isEnabled} ${controller.connections.database[currentScene].roamTime} ${controller.connections.database[currentScene].roamSpeed} ${controller.connections.database[currentScene].roamList}`)
			} catch (e) {
				logger.log("Error sending ptzroaminfo")
			}
			break;
		default:
			logger.log(`Invalid PTZ Command: ${userCommand}`);
			return false;
	}
	return true;

       function findBox(xcord, ycord) {
                        let camLayout = controller.connections.database["customcamscommand"];
                        let sceneLayout;
                
                        if (currentCamList.length >= 5) {
                                sceneLayout = "6boxbig";
                        } else if (currentCamList.length >= 4) {
                                sceneLayout = "4boxbig";
                        } else if (currentCamList.length >= 3) {
                                sceneLayout = "3boxbig";
                        } else if (currentCamList.length >= 2) {
                                sceneLayout = "2boxbig";
                        } else if (currentCamList.length >= 2 && camLayout == "customcamstl") {
                                sceneLayout = "2boxtl";
                        } else if (currentCamList.length >= 2 && camLayout == "customcamstr") {
                                sceneLayout = "2boxtr";
                        } else if (currentCamList.length >= 2 && camLayout == "customcamsbl") {
                                sceneLayout = "2boxbl";
                        } else if (currentCamList.length >= 2 && camLayout == "customcamsbr") {
                                sceneLayout = "2boxbr";
                        } else if (currentCamList.length >= 1) {
                                sceneLayout = "1box";
                        }
                        // Use the configuration data to determine zones
                        const zones = Object.values(config.scenePositions[sceneLayout]);
                        x_unscaled = xcord
                        y_unscaled = ycord
                        zoom = arg3
                        // Initialize zone to -1
                        let zone = -1;
                        let x = 960;
                        let y = 540;
                        let sourceWidth;
                        let sourceHeight;
                        let scaleX;
                        let scaleY;
                        // Determine the zone and scaled coordinates
                        for (let i = 0; i < zones.length; i++) {
                                const z = zones[i];
                                if (x_unscaled >= z.positionX && x_unscaled < z.positionX + z.width &&
                                        y_unscaled >= z.positionY && y_unscaled < z.positionY + z.height) {
                                        zone = i; // Use 0-based index for zones
                                        x = (x_unscaled - z.positionX) / z.scaleX;
                                        y = (y_unscaled - z.positionY) / z.scaleY;
                                        sourceWidth = z.sourceWidth;
                                        sourceHeight = z.sourceHeight;
                                        scaleX = z.scaleX
                                        scaleY = z.scaleY
                                        break;
                                }
                        }

                        // If invalid coordinates or no matching zone, return false
                        if (zone === -1) {
                                return false;
                        }

                        // Determine camera name using 0-based index
                        camName = currentCamList[zone];
                        if (camName === undefined) {
                                return false;
                        }

                        ptzcamName = helper.cleanName(camName);
                        baseName = config.customCommandAlias[ptzcamName] ?? ptzcamName;
                        ptzcamName = config.axisCameraCommandMapping[baseName] ?? baseName;

                        // Check if camName contains "multi" and find the parent scene if it does
                        if (ptzcamName.includes("multi")) {
                                let parentScene = "";
                                // Iterate through the multiScenes to find the parent scene
                                for (let multiScene in config.multiScenes) {
                                        let sceneList = config.multiScenes[multiScene];

                                        for (let i = 0; i < sceneList.length; i++) {
                                                let sceneName = sceneList[i] || "";
                                                sceneName = helper.cleanName(sceneName);
                                                if (ptzcamName == sceneName) {
                                                        // Found match
                                                        parentScene = multiScene;
                                                        break;
                                                }
                                        }
                                        // Exit outer loop if parentScene is found
                                        if (parentScene != "") {
                                                break;
                                        }
                                }
                                // Set camName to parentScene if a match was found
                                if (parentScene != "") {
                                        ptzcamName = parentScene;
                                }
                        }
                        return {x, y, zoom, sourceWidth, sourceHeight, scaleX, scaleY,  ptzcamName};
        }  
}

async function checkNuthouseCommand(controller, userCommand, accessProfile, channel, message, currentScene) {
	if (userCommand == null || currentScene != "nuthouse") {
		return false;
	}
	let messageArgs = message.split(" ");

	let arg1 = messageArgs[1] || "";
	let arg2 = messageArgs[2] || "";
	let arg3 = messageArgs[3] || "";

	arg1 = arg1.trim().toLowerCase();
	arg2 = arg2.trim().toLowerCase();
	arg3 = arg3.trim().toLowerCase();

	switch (userCommand) {
		case "ptzpan":
			// logger.log('ptzpan',arg1);
			controller.connections.obsBot.pan(arg1);
			break;
		case "ptztilt":
			controller.connections.obsBot.tilt(arg1);
			break;
		case "ptzzoom":
			controller.connections.obsBot.setZoom(arg1);
			break;
		case "ptzfov":
			controller.connections.obsBot.setFOV(arg1);
			break;
		case "ptztracking":
			controller.connections.obsBot.setTracking(arg1);
			break;
		case "ptzhome":
			controller.connections.obsBot.resetPosition();
			break;
		case "ptzpreset":
			let num = 1;
			if (arg1 == "counter") {
				num = 1;
			} else if (arg1 == "table" || arg1 == "bench") {
				num = 2;
			} else if (arg1 == "room") {
				num = 3;
			}
			controller.connections.obsBot.setPreset(num);
			break;
		case "ptzstop":
			controller.connections.obsBot.stop();
			break;
		case "ptzwake":
			controller.connections.obsBot.wake();
			break;
		default:
			logger.log(`Invalid OBSBot Command: ${userCommand}`);
			return false;
	}
	//finish OBSBot commands
	return true;
}

async function checkCustomCamCommand(controller, userCommand, accessProfile, channel, message, currentScene) {
	if (userCommand == null || currentScene != "custom") {
		return false;
	}
	let messageArgs = message.split(" ");

	let arg1 = messageArgs[1] ?? "";
	let arg2 = messageArgs[2] ?? "";
	let arg3 = messageArgs[3] ?? "";

	arg1 = arg1.trim().toLowerCase();
	arg2 = arg2.trim().toLowerCase();
	arg3 = arg3.trim().toLowerCase();

	let fullArgs = message.split(' ').slice(1).join(' ')
	let currentCamList = controller.connections.database["customcam"] ?? [];
	let currentUserCommand = controller.connections.database["customcamscommand"] ?? "customcams";

	controller.connections.database["layoutpresets"] = controller.connections.database["layoutpresets"] || {};

	// logger.log("Cam Save",userCommand,currentCamList,currentUserCommand);
	let preset = null;
	switch (userCommand) {
		case "camsave":
			if (currentCamList.length > 0) {
				if (arg1 != "") {
					//2nd argument provided
					controller.connections.database["layoutpresets"][arg1] = { list: currentCamList, command: currentUserCommand };
				} else {
					controller.connections.database["layoutpresets"]["temporarylayoutsave"] = { list: currentCamList, command: currentUserCommand };
				}
			} else {
				logger.log("Failed to save layout. No current cam list");
			}
			break;
		case "camload":
			//2nd argument provided
			preset = controller.connections.database["layoutpresets"]?.[arg1] ?? null;
			if (preset != null && preset.list && preset.command) {
				let chatmessage = preset.list.join(' ');
				switchToCustomCams(controller, channel, accessProfile, preset.command, chatmessage)
			} else if (arg1 == "") {
				let previous = controller.connections.database["layoutpresets"]["temporarylayoutsave"] ?? {};
				if (previous != null && previous.list && previous.command) {
					let chatmessage = previous.list.join(' ');
					switchToCustomCams(controller, channel, accessProfile, previous.command, chatmessage)
				}
			}
			break;
		case "campresetremove":
			preset = controller.connections.database["layoutpresets"]?.[arg1] ?? null;
			if (preset != null) {
				let response = delete controller.connections.database["layoutpresets"][arg1];
				if (response != true) {
					logger.log(`Failed to remove cam preset ${arg1}: ${response} ${controller.connections.database["layoutpresets"]}`);
				}
			}
			break;
		case "camrename":
			preset = controller.connections.database["layoutpresets"]?.[arg1] ?? null;
			if (preset != null) {
				controller.connections.database["layoutpresets"][arg2] = preset;
				let response = delete controller.connections.database["layoutpresets"][arg1];
				if (response != true) {
					logger.log(`Failed to rename cam preset ${arg1}, ${arg2}: ${response} ${controller.connections.database["layoutpresets"]}`);
				}
			}
			break;
		case "camclear":
			controller.connections.database["layoutpresets"] = {};
			break;
		case "camlist":
			controller.connections.twitch.send(channel, `Cam Layout Presets: ${Object.keys(controller.connections.database["layoutpresets"]).toString()}`)
			break;
		default:
			// logger.log(`Invalid Cam Command: ${userCommand}`);
			return false;
	}
	//finish Cam commands
	return true;
}

async function checkExtraCommand(controller, userCommand, accessProfile, channel, message, currentScene) {
	//extra
	message = message.trim();
	let messageArgs = message.split(" ");
	let arg1 = messageArgs[1] || "";
	let arg2 = messageArgs[2] || "";
	let arg3 = messageArgs[3] || "";
	let arg4 = messageArgs[4] || "";
	arg1 = arg1.trim();
	arg2 = arg2.trim();
	let arg1Clean = helper.cleanName(arg1) ?? "";
	let arg2Clean = helper.cleanName(arg2) ?? "";

	let arg1Base = config.customCommandAlias[arg1Clean] ?? arg1Clean;

	let fullArgs = message.split(' ').slice(1).join(' ');
	let argsList = fullArgs.split(" ");
	let audioSource = "";
	let currentCamList = controller.connections.database["customcam"];
	let currentCustomScene = currentCamList[0] ?? "";
	currentCustomScene = helper.cleanName(currentCustomScene) ?? "";
	if (currentCustomScene == "") {
		currentCustomScene = currentScene
	}
	let currentSceneBase = config.customCommandAlias[currentCustomScene] ?? currentCustomScene;


	// logger.log("Extra Command",accessProfile,userCommand,fullArgs,currentScene,currentCamList);

	switch (userCommand) {
		case "resetsourcef":
			controller.connections.obs.local.restartSource(fullArgs);
			break;
		case "resetcloudsourcef":
			controller.connections.obs.cloud.restartSource(fullArgs);
			break;
		case "resetbackpackf":
			controller.connections.obs.cloud.restartSource("Maya RTMP 1");
			controller.connections.obs.cloud.restartSource("RTMP Mobile");
			controller.connections.obs.cloud.restartSource("Space RTMP Backpack");
			break;
		case "resetlivecamf":
			controller.connections.obs.cloud.restartSource("Maya RTMP 2");
			controller.connections.obs.cloud.restartSource("RTMP AlveusStudio");
			controller.connections.obs.cloud.restartSource("Space RTMP Server");
			break;
		case "resetpcf":
			controller.connections.obs.cloud.restartSource("Maya RTMP 3");
			controller.connections.obs.cloud.restartSource("RTMP AlveusDesktop");
			controller.connections.obs.cloud.restartSource("Space RTMP Desktop");
			break;
		case "resetphonef":
			controller.connections.obs.cloud.restartSource("RTMP Mobile");
			break;
		case "resetsource":
			controller.connections.obs.local.restartSceneItem(controller.connections.obs.local.currentScene, fullArgs);
			break;
		case "resetcloudsource":
			controller.connections.obs.cloud.restartSceneItem(controller.connections.obs.cloud.currentScene, fullArgs);
			break;
		case "resetbackpack":
			controller.connections.obs.cloud.restartSceneItem(controller.connections.obs.cloud.currentScene, "Maya RTMP 1");
			controller.connections.obs.cloud.restartSceneItem(controller.connections.obs.cloud.currentScene, "RTMP Mobile");
			controller.connections.obs.cloud.restartSceneItem(controller.connections.obs.cloud.currentScene, "Space RTMP Backpack");
			break;
		case "resetlivecam":
			controller.connections.obs.cloud.restartSceneItem(controller.connections.obs.cloud.currentScene, "Maya RTMP 2");
			controller.connections.obs.cloud.restartSceneItem(controller.connections.obs.cloud.currentScene, "RTMP AlveusStudio");
			controller.connections.obs.cloud.restartSceneItem(controller.connections.obs.cloud.currentScene, "Space RTMP Server");
			break;
		case "resetpc":
			controller.connections.obs.cloud.restartSceneItem(controller.connections.obs.cloud.currentScene, "Maya RTMP 3");
			controller.connections.obs.cloud.restartSceneItem(controller.connections.obs.cloud.currentScene, "RTMP AlveusDesktop");
			controller.connections.obs.cloud.restartSceneItem(controller.connections.obs.cloud.currentScene, "Space RTMP Desktop");
			break
		case "resetphone":
			controller.connections.obs.cloud.restartSceneItem(controller.connections.obs.cloud.currentScene, "RTMP Mobile");
			controller.connections.obs.cloud.restartSceneItem(controller.connections.obs.cloud.currentScene, "Space RTMP Phone");
			break
		case "resetextra":
			controller.connections.obs.cloud.restartSceneItem(controller.connections.obs.cloud.currentScene, "Space RTMP Extra");
			break
		case "resetcam":
			let camname = arg1Clean;
			//remove possible cam wording
			camname = "fullcam " + camname;
			controller.connections.obs.local.restartSceneItem(controller.connections.obs.local.currentScene, camname);
			break;
		case "setalveusscene":
			controller.connections.obs.local.setScene(fullArgs);
			clearCustomCamsDB(controller);
			break;
		case "setcloudscene":
			controller.connections.obs.cloud.setScene(fullArgs);
			clearCustomCamsDB(controller);
			break;
		case "setrestricted":
			//toggle time restrictions
			if (arg1 == "1" || arg1 == "on" || arg1 == "yes") {
				controller.connections.database.timeRestrictionDisabled = false;
			} else if (arg1 == "off" || arg1 == "0" || arg1 == "no") {
				controller.connections.database.timeRestrictionDisabled = true;
			} else {
				controller.connections.database.timeRestrictionDisabled = false;
			}
			break;
		case "changeserver":
			logger.log("changing server to:", arg1);
			let invalid = false;
			if (arg1 == "maya") {
				controller.connections.obs.cloud.disconnect();
				controller.connections.obs.cloud = await controller.connections.obs.create("cloudMaya");
			} else if (arg1 == "alveus") {
				controller.connections.obs.cloud.disconnect();
				controller.connections.obs.cloud = await controller.connections.obs.create("cloudAlveus");
			} else if (arg1 == "space") {
				controller.connections.obs.cloud.disconnect();
				controller.connections.obs.cloud = await controller.connections.obs.create("cloudSpace");
			} else {
				//invalid
				invalid = true;
			}
			setTimeout(async function () {
				let cloudLive = await controller.connections.obs.cloud.isLive() || false;
				let serverName = controller.connections.obs.cloud.name;
				logger.log("Change Server Status: ", serverName, cloudLive, controller.connections.obs.cloud.name);
				if (cloudLive) {
					controller.connections.twitch.send(channel, `Cloud Server changed to ${serverName}`);
				} else {
					controller.connections.twitch.send(channel, `Cloud Server-${serverName} offline`);
				}
			}, 5000);
			if (!invalid) {
				controller.connections.database.cloudServer = arg1;
			}
			break;
		case "setmute":
			let muteStatus = null;
			if (arg2 == "1" || arg2 == "on" || arg2 == "yes") {
				muteStatus = true;
			} else if (arg2 == "off" || arg2 == "0" || arg2 == "no") {
				muteStatus = false;
			} else {
				muteStatus = arg2;
			}
			if (arg1 == "" || arg1 == "mic") {
				audioSource = config.sceneAudioSource[currentSceneBase];
			} else {
				audioSource = config.sceneAudioSource[arg1Base];
			}
			if (audioSource == null || audioSource == "") {
				audioSource = arg1;
			}
			controller.connections.obs.local.setMute(audioSource, muteStatus);
			break;
		case "mutecam":
			if (arg1 == "" || arg1 == "mic") {
				audioSource = config.sceneAudioSource[currentSceneBase];
				controller.connections.obs.local.setMute(audioSource, true);
			} else if (arg1 == "all") {
				for (const source in config.micGroups["livecams"]) {
					controller.connections.obs.local.setMute(config.micGroups["livecams"][source].name, true);
				}
				for (const source in config.micGroups["restrictedcams"]) {
					controller.connections.obs.local.setMute(config.micGroups["restrictedcams"][source].name, true);
				}
				controller.connections.obs.cloud.setMute(config.globalMusicSource, false);
			} else if (arg1 == "music") {
				controller.connections.obs.cloud.setMute(config.globalMusicSource, true);
			} else {
				audioSource = config.sceneAudioSource[arg1Base];

				if (audioSource == null || audioSource == "") {
					audioSource = arg1;
				}

				controller.connections.obs.local.setMute(audioSource, true);
			}
			break;
		case "unmutecam":
			if (arg1 == "all") {
				for (const source in config.micGroups["livecams"]) {
					controller.connections.obs.local.setInputVolume(config.micGroups["livecams"][source].name, config.micGroups["livecams"][source].volume);
					controller.connections.obs.local.setMute(config.micGroups["livecams"][source].name, false);
				}
				controller.connections.obs.cloud.setMute(config.globalMusicSource, true);
			} else if (arg1 == "music") {
				controller.connections.obs.cloud.setMute(config.globalMusicSource, false);
			} else {
				if (arg1 == "" || arg1 == "mic") {
					audioSource = config.sceneAudioSource[currentSceneBase];
				} else {
					audioSource = config.sceneAudioSource[arg1Base];
					if (audioSource == null || audioSource == "") {
						audioSource = arg1;
					}
				}
				let hasAccess = false;
				if (Object.keys(config.micGroups["livecams"]).includes(audioSource)) {
					hasAccess = true;
				} else {
					//check if Admin
					if (config.userPermissions.commandPriority[0] == accessProfile.accessLevel) {
						hasAccess = true;
						//check if super user
					} else if (config.userPermissions.commandPriority[1] == accessProfile.accessLevel) {
						hasAccess = true;
					}
				}
				if (hasAccess) {
					controller.connections.obs.local.setMute(audioSource, false);
				}

			}
			break;
		case "muteallcams":
			for (const source in config.micGroups["livecams"]) {
				controller.connections.obs.local.setMute(config.micGroups["livecams"][source].name, true);
			}
			for (const source in config.micGroups["restrictedcams"]) {
				controller.connections.obs.local.setMute(config.micGroups["restrictedcams"][source].name, true);
			}
			controller.connections.obs.cloud.setMute(config.globalMusicSource, false);
			break;
		case "unmuteallcams":
			for (const source in config.micGroups["livecams"]) {
				controller.connections.obs.local.setInputVolume(config.micGroups["livecams"][source].name, config.micGroups["livecams"][source].volume);
				controller.connections.obs.local.setMute(config.micGroups["livecams"][source].name, false);
			}
			controller.connections.obs.cloud.setMute(config.globalMusicSource, true);
			break;
		case "removecam":
			if (currentScene != "custom") {
				return false;
			}

			let newListRemoveCam = currentCamList.slice();


			for (let arg of argsList) {
				if (arg != null && arg != "") {
					// logger.log("arg",argsList,arg);
					let camName = helper.cleanName(arg);

					let overrideArgs = config.customCommandAlias[camName];
					if (overrideArgs != null) {
						//allow alias to change entire argument
						let newArgs = overrideArgs.split(" ");
						if (newArgs.length > 1) {
							for (let newarg of newArgs) {
								if (newarg != "") {
									argsList.push(newarg);
								}
							}
							continue;
						}
						camName = overrideArgs;
					}

					//camName = "fullcam"+camName;

					//remove cam
					for (let i = 0; i < newListRemoveCam.length; i++) {
						if (newListRemoveCam[i].includes(camName)) {
							newListRemoveCam.splice(i, 1);
						}
					}
					// let index = newListRemoveCam.indexOf(camName);
					// if (index !== -1) {
					// 	newListRemoveCam.splice(index, 1);
					// }
				}
			}

			if (newListRemoveCam.length > 0) {
				fullArgs = newListRemoveCam.join(' ');

				logger.log(`Remove Cams: ${argsList} - new fullargs: ${fullArgs}`);
				switchToCustomCams(controller, channel, accessProfile, userCommand, fullArgs);
			}
			break;
		case "addcam":
			// logger.log("addcam",currentCamList,argsList,currentScene)
			if (currentScene != "custom") {
				return false;
			}

			let newListAddCam = currentCamList.slice();

			for (let arg of argsList) {
				if (arg != null && arg != "") {
					// logger.log("arg",argsList,arg);
					let camName = helper.cleanName(arg);

					let overrideArgs = config.customCommandAlias[camName];
					logger.log("addcam alias", config.customCommandAlias, camName, overrideArgs)
					if (overrideArgs != null) {
						//allow alias to change entire argument
						let newArgs = overrideArgs.split(" ");
						if (newArgs.length > 1) {
							for (let newarg of newArgs) {
								if (newarg != "") {
									newListAddCam.push(newarg);
								}
							}
							continue;
						}
						camName = overrideArgs;
					}
					camName = "fullcam" + camName;
					//add cam
					if (!newListAddCam.includes(camName)) {
						newListAddCam.push(camName);
					}
				}
			}

			if (newListAddCam.length > 0) {
				fullArgs = newListAddCam.join(' ');

				logger.log(`Add Cams: ${argsList} - new fullargs: ${fullArgs}`);
				switchToCustomCams(controller, channel, accessProfile, userCommand, fullArgs);
			}
			break;
		case "scenecams":
			if (currentScene != "custom") {
				return false;
			}

			let output = "";
			if (arg1 == "json") {
				output = JSON.stringify(currentCamList);
			} else if (arg1 == "jsonmap") {
				const jsonobj = {};
				for (let i = 0; i < currentCamList.length; i++) {
					jsonobj[i + 1] = currentCamList[i];
				}
				output = JSON.stringify(jsonobj);
			} else {
				for (let i = 0; i < currentCamList.length; i++) {
					output = `${output}${i + 1}: ${currentCamList[i]}`;
					if (i != currentCamList.length - 1) {
						output = `${output}, `;
					}
				}
			}

			controller.connections.twitch.send(channel, output)
			break;
		case "swapcam":
			if (currentScene != "custom") {
				return false;
			}

			userCommand = controller.connections.database["customcamscommand"] ?? "customcams";

			// if (controller.connections.database["customcamsbig"]) {
			// 	userCommand = "customcamsbig";
			// } else {
			// 	userCommand = "customcams";
			// }
			if (arg1 == "" || arg2 == "") {
				if (currentCamList.length == 2) {
					let temp = currentCamList[0];
					currentCamList[0] = currentCamList[1];
					currentCamList[1] = temp;
					fullArgs = currentCamList.join(' ');
					switchToCustomCams(controller, channel, accessProfile, userCommand, fullArgs);
					return true;
				} else {
					return false;
				}
			}
			//replace current cam list with new position
			// swapcam 4 cam or swapcam cam cam2

			let cam1 = helper.cleanName(arg1);
			cam1 = config.customCommandAlias[cam1] || cam1;
			cam1 = "fullcam" + cam1;
			let pos1 = currentCamList.indexOf(cam1);
			if (pos1 == -1) {
				//get cam at location
				pos1 = parseInt(arg1);
				if (!isNaN(pos1)) {
					pos1 = pos1 - 1
				} else {
					pos1 = null;
				}

			}

			let cam2 = helper.cleanName(arg2);
			cam2 = config.customCommandAlias[cam2] || cam2;
			cam2 = "fullcam" + cam2;
			let pos2 = currentCamList.indexOf(cam2);
			if (pos2 == -1) {
				//get cam at location
				pos2 = parseInt(arg2);
				if (!isNaN(pos2)) {
					pos2 = pos2 - 1
				} else {
					pos2 = null;
				}

			}

			//if both are valid cams or positions, swap them
			//if not, replace pos1 with cam2
			let newList = currentCamList.slice();

			if (pos1 != null && pos2 != null) {
				let temp1 = newList[pos1];
				newList[pos1] = newList[pos2];
				newList[pos2] = temp1;
			} else if (pos1 != null) {
				newList[pos1] = cam2;
			} else if (pos2 != null) {
				newList[pos2] = cam1;
			} else {
				break;
			}

			//fill empty slots with nocam
			for (let i = 0; i < newList.length; i++) {
				if (newList[i] == null || newList[i] == "") {
					newList[i] = "fullcamremove";
				}
			}
			newList = newList.filter(i => i != "fullcamremove");

			if (newList.length > 0) {
				fullArgs = newList.join(' ');

				logger.log(`Swap Cam ${cam1} to ${cam2} - fullargs: ${fullArgs}`);
				switchToCustomCams(controller, channel, accessProfile, userCommand, fullArgs);
			}
			break;
		// case "nightcams":
		// 	fullArgs = "pasture parrot fox crow";
		// 	switchToCustomCams(controller, channel, accessProfile, "customcams", fullArgs);
		// 	break;
		// case "nightcamsbig":
		// 	fullArgs = "marmoset pasture parrot fox foxcorner crowmulti";
		// 	switchToCustomCams(controller, channel, accessProfile, "customcamsbig", fullArgs);
		// 	break;
		// case "indoorcams":
		// 	fullArgs = "georgie noodle isopods roaches";
		// 	switchToCustomCams(controller, channel, accessProfile, "customcams", fullArgs);
		// 	break;
		// case "indoorcamsbig":
		// 	fullArgs = "georgie noodle isopods roaches";
		// 	switchToCustomCams(controller, channel, accessProfile, "customcamsbig", fullArgs);
		// 	break;
		case "customcamstl":
		case "customcamstr":
		case "customcamsbl":
		case "customcamsbr":
		case "customcamsbig":
		case "customcams":
			switchToCustomCams(controller, channel, accessProfile, userCommand, fullArgs)
			break;
		case "mutemusic":
			controller.connections.obs.cloud.setMute(config.globalMusicSource, true);
			break;
		case "unmutemusic":
			controller.connections.obs.cloud.setMute(config.globalMusicSource, false);
			break;
		case "mutemusiclocal":
			controller.connections.obs.local.setMute(config.globalMusicSource, true);
			break;
		case "unmutemusiclocal":
			controller.connections.obs.local.setMute(config.globalMusicSource, false);
			break;
		case "musicvolume":
			let amount = parseInt(arg1) || 0;
			let scaledVol = 100 - amount;
			scaledVol = 0 - scaledVol;
			controller.connections.obs.local.setInputVolume(config.globalMusicSource, scaledVol);
			controller.connections.obs.cloud.setInputVolume(config.globalMusicSource, scaledVol);
			break;
		case "musicnext":
			controller.connections.obs.local.nextMediaSource(config.globalMusicSource);
			controller.connections.obs.cloud.nextMediaSource(config.globalMusicSource);
			break;
		case "musicprev":
			controller.connections.obs.local.prevMediaSource(config.globalMusicSource);
			controller.connections.obs.cloud.prevMediaSource(config.globalMusicSource);
			break;
		case "setvolume":
			audioSource = "";
			let inputVol = arg2;
			if (arg1 == "all") {
				let amount2 = parseInt(inputVol) || 0;
				let scaledVol2 = amount2 - 100;
				for (const source in config.micGroups["livecams"]) {
					controller.connections.obs.local.setInputVolume(config.micGroups["livecams"][source].name, scaledVol2);
				}
			} else {
				if (arg1 == "" || arg1 == "mic" || arg1 == "mics" || arg1 == "cam" || arg1 == "cams") {
					audioSource = config.sceneAudioSource[currentSceneBase];
					inputVol = arg2;
				} if (arg1 == "music") {
					audioSource = config.globalMusicSource
					inputVol = arg2;
				} else {
					audioSource = config.sceneAudioSource[arg1Clean];
					if (audioSource == null || audioSource == "") {
						audioSource = arg1;
					}
					inputVol = arg2;
				}
				let amount2 = parseInt(inputVol) || 0;
				let scaledVol2 = amount2 - 100;
				if (arg1.includes("music")) {
					audioSource = config.globalMusicSource;
				}
				controller.connections.obs.local.setInputVolume(audioSource, scaledVol2);
				if (audioSource == config.globalMusicSource){
					controller.connections.obs.cloud.setInputVolume(config.globalMusicSource, scaledVol2);
				}
			}
			break;
		case "getvolume":
			if (arg1 == "" || arg1 == "all") {
				let output = "";
				for (const source in config.micGroups["livecams"]) {
					let dbVolume = await controller.connections.obs.local.getInputVolume(config.micGroups["livecams"][source].name);
					dbVolume = parseInt(dbVolume);
					if (!isNaN(dbVolume)) {
						let correctedVol = 100 + dbVolume;

						let isMuted = await controller.connections.obs.local.getMute(config.micGroups["livecams"][source].name);
						let muteStatus = "";
						if (isMuted) {
							muteStatus = "m";
						}
						output = `${output}${source} - ${correctedVol.toFixed(1).replace(/[.,]0$/, "")}${muteStatus}, `;
					}
				}
				for (const source in config.micGroups["restrictedcams"]) {
					let dbVolume = await controller.connections.obs.local.getInputVolume(config.micGroups["restrictedcams"][source].name);
					dbVolume = parseInt(dbVolume);
					if (!isNaN(dbVolume)) {
						let correctedVol = 100 + dbVolume;

						let isMuted = await controller.connections.obs.local.getMute(config.micGroups["restrictedcams"][source].name);
						let muteStatus = "";
						if (isMuted) {
							muteStatus = "m";
						}
						output = `${output}${source} - ${correctedVol.toFixed(1).replace(/[.,]0$/, "")}${muteStatus}, `;
					}
				}
				//get music
				let dbVolume = await controller.connections.obs.cloud.getInputVolume("Music Playlist Global");
				dbVolume = parseInt(dbVolume);
				if (!isNaN(dbVolume)) {
					let correctedVol = 100 + dbVolume;

					let isMuted = await controller.connections.obs.cloud.getMute("Music Playlist Global");
					let muteStatus = "";
					if (isMuted) {
						muteStatus = "m";
					}
					output = `${output}music - ${correctedVol.toFixed(1).replace(/[.,]0$/, "")}${muteStatus}, `;
				}

				// logger.log('getvolume all',output);
				controller.connections.twitch.send(channel, `Volumes: ${output}`)
			} else {
				let volName = arg1Clean;
				if (arg1 == "mic" || arg1 == "mics" || arg1 == "cam" || arg1 == "cams") {
					audioSource = config.sceneAudioSource[currentSceneBase];
					volName = currentSceneBase;
				} else {
					audioSource = config.sceneAudioSource[arg1Clean];
					if (audioSource == null || audioSource == "") {
						audioSource = arg1;
					}
				}
				if (arg1 == "music") {
					//get music
					let dbVolume = await controller.connections.obs.cloud.getInputVolume("Music Playlist Global");
					dbVolume = parseInt(dbVolume);
					if (!isNaN(dbVolume)) {
						let correctedVol = 100 + dbVolume;

						let isMuted = await controller.connections.obs.cloud.getMute("Music Playlist Global");
						let muteStatus = "";
						if (isMuted) {
							muteStatus = "m";
						}
						controller.connections.twitch.send(channel, `Music Volume: ${correctedVol.toFixed(1).replace(/[.,]0$/, "")}${muteStatus}`)
					}
				} else {
					let dbVolume = await controller.connections.obs.local.getInputVolume(audioSource);
					dbVolume = parseInt(dbVolume);
					if (!isNaN(dbVolume)) {
						let correctedVol = 100 + dbVolume;
						let isMuted = await controller.connections.obs.local.getMute(audioSource);
						logger.log("getvolume", audioSource, isMuted);
						let muteStatus = "";
						if (isMuted) {
							muteStatus = "m";
						}
						// logger.log("Setting",correctedVol);
						controller.connections.twitch.send(channel, `Volume: ${volName} - ${correctedVol.toFixed(1).replace(/[.,]0$/, "")}${muteStatus}`)
					}
				}
			}
			break;
		case "resetvolume":
			for (const source in config.micGroups["livecams"]) {
				controller.connections.obs.local.setInputVolume(config.micGroups["livecams"][source].name, config.micGroups["livecams"][source].volume);
			}
			break;
		default:
			return false;
	}

	return true;
}

async function checkUnifiCommand(controller, userCommand, accessProfile, channel, message, currentScene) {

	let messageArgs = message.split(" ");
	let arg1 = messageArgs[1] || "";
	let arg2 = messageArgs[2] || "";
	let arg3 = messageArgs[3] || "";
	let arg4 = messageArgs[4] || "";
	arg1 = arg1.trim();
	arg2 = arg2.trim();

	let apClient, name, ap_name, signal, chatMessage, response = null;

	switch (userCommand) {
		case "apsignal":
			apClient = await controller.connections.unifi.getSignal("liveu");
			if (apClient) {
				signal = apClient.signal;
				ap_name = apClient.ap_name;
				if (ap_name.includes(":") || controller.connections.unifi.isValidMacAddress(ap_name)) {
					ap_name = "AlveusAP"
				}
				chatMessage = `LiveU Signal ${signal}(${ap_name})`;
			} else {
				chatMessage = `LiveU Not Found`;
			}
			controller.connections.twitch.send(channel, chatMessage);
			break;
		case "apreconnect":
			response = await controller.connections.unifi.clientReconnect("liveu");
			if (response) {
				controller.connections.twitch.send(channel, `Reconnecting LiveU`);
			} else {
				controller.connections.twitch.send(channel, `Reconnecting LiveU Failed`);
			}
			break;
		case "apclientinfo":
			apClient = await controller.connections.unifi.getSignal(arg1);
			if (apClient) {
				signal = apClient.signal;
				ap_name = apClient.ap_name;
				if (ap_name.includes(":") || controller.connections.unifi.isValidMacAddress(ap_name)) {
					ap_name = "AlveusAP"
				}
				chatMessage = `${arg1} signal ${signal}(${ap_name})`;
			} else {
				chatMessage = `${arg1} not found`;
			}
			controller.connections.twitch.send(channel, chatMessage);
			break;
		case "apclientreconnect":
			response = await controller.connections.unifi.clientReconnect(arg1);
			if (response) {
				controller.connections.twitch.send(channel, `Reconnecting ${arg1}`);
			} else {
				controller.connections.twitch.send(channel, `Reconnecting ${arg1} Failed`);
			}
			break;
		default:
			return false;
	}

	return true;
}

function clearCustomCamsDB(controller) {
	controller.connections.database["customcam"] = [];
}

async function switchToCustomCams(controller, channel, accessProfile, userCommand, fullArgs) {
	console.log("switch", channel, accessProfile, userCommand, fullArgs);
	let obsSources = await controller.connections.obs.local.getSceneItemList("Custom Cams") || [];  //controller.connections.obs.local.sceneList || [];
	let obsList = [];
	let currentCamList = [];
	for (let scene of obsSources) {
		let name = scene.sourceName;
		let enabled = scene.sceneItemEnabled;
		if (name.includes("fullcam")) {
			let sceneName = helper.cleanName(name);
			obsList.push(sceneName);
			if (enabled) {
				currentCamList.push(sceneName);
			}
		}
	}

	// let currentCamList = controller.connections.database["customcam"];
	fullArgs = fullArgs ?? "";
	fullArgs = fullArgs.trim();
	let argsList = fullArgs.split(" ");
	argsList.splice(6);
	let camList = [];

	// logger.log("user access profile", accessProfile);
	let validCommand = true;
	let invalidAccess = false;

	let newArgList = [];
	//convert to basenames
	for (let arg of argsList) {
		if (arg != null && arg != "") {
			// logger.log("arg",argsList,arg);
			let camName = helper.cleanName(arg);

			let overrideArgs = config.customCommandAlias[camName];
			// logger.log("ccam alias",config.customCommandAlias,camName,overrideArgs)
			if (overrideArgs != null) {
				//allow alias to change entire argument
				let newArgs = overrideArgs.split(" ");
				if (newArgs.length > 1) {
					for (let newarg of newArgs) {
						if (newarg != "") {
							newArgList.push(newarg);
						}
					}
					continue;
				}
				camName = overrideArgs;
			}

			newArgList.push(camName);
		}
	}
	//check access for cams
	for (let camName of newArgList) {

		let fullCamName = "fullcam" + camName;

		// logger.log("arg",arg,camName,fullCamName);
		//check if valid source
		if (!obsList.includes(camName)) {
			if (camName != "empty" && camName != "blank") {
				validCommand = false;
				break;
			}
		}

		let hasAccess = false;
		if (currentCamList.includes(camName) || camName == "empty" || camName == "blank") {
			hasAccess = true;
		}

		//convert name to base name and check if multiscene
		let baseCamName = config.multiCustomCamScenesConverted[camName] || "";
		if (!hasAccess && baseCamName != null && baseCamName != "") {
			for (let currcam of currentCamList) {
				currcam = currcam ?? "";
				// currcam = helper.cleanName(currcam);
				let baseName = config.multiCustomCamScenesConverted[currcam] || "";
				//newcam is part of a current cam multiscene
				if (baseCamName != "" && baseCamName == baseName) {
					hasAccess = true;
					break;
				}
			}
		}

		if (!hasAccess) {
			//Admin
			if (config.userPermissions.commandPriority[0] == accessProfile.accessLevel) {
				hasAccess = true;
				//Superuser
			} else if (config.userPermissions.commandPriority[1] == accessProfile.accessLevel) {
				hasAccess = true;
				//Mod
			} else if (!config.timeRestrictedScenes.includes(camName)) {
				logger.log("Reached Regular Access", "Non time restricted", camName);
				hasAccess = true;
			} else if (config.userPermissions.commandPriority[2] == accessProfile.accessLevel) {
				logger.log("Reached Mod Access", camName);
				//not directly allowed
				//check if allowed access to cam
				//specific mod time restrictions
				if (config.timeRestrictedScenes.includes(camName)) {
					//check time
					let now = new Date();
					var minutes = now.getUTCMinutes();
					var hour = now.getUTCHours();
					if (hour >= config.restrictedHours.start && hour < config.restrictedHours.end) {
						//restricted time
						hasAccess = false;
					} else {
						//allow access to mods
						hasAccess = true;
					}
				} else {
					logger.log("Reached Mod Access", "Non time restricted", camName);
					hasAccess = true;
				}
			} else {
				//too low of permission
				logger.log("Switch Cams: Too Low Permission", accessProfile, fullArgs);
				validCommand = false;
				invalidAccess = true;
				break;
			}
		}

		if (hasAccess) {
			camList.push(fullCamName);
		} else {
			validCommand = false;
			invalidAccess = true;
			break;
		}
	}

	if (!validCommand) {
		logger.log("Switch Cams: Invalid Command", accessProfile, "fullargs", fullArgs); // "argslist",argsList,"camlist", camList,"obslist",obsList);
		//doesnt have access to one of the cams
		if (invalidAccess) {
			controller.connections.twitch.send(channel, `Invalid Access`);
		} else {
			controller.connections.twitch.send(channel, `Invalid Command`);
		}
		return;
	}

	let currentScene = controller.connections.obs.local.currentScene || "";
	currentScene = helper.cleanName(currentScene);

	if (currentScene == "custom" && fullArgs == "" && currentCamList.length > 0) {
		camList = currentCamList;
	}
	//logger.log("customcams",userCommand,currentCamList,argsList,argsList.length,fullArgs,camList);

	let response = null;
	if (camList.length >= 5) {
		response = await setCustomCams(controller, obsSources, "Custom Cams", camList, { "border": "6CamBigBorder" }, config.scenePositions["6boxbig"]);
	} else if (camList.length >= 4 && userCommand == "customcamsbig") {
		response = await setCustomCams(controller, obsSources, "Custom Cams", camList, { "border": "4CamBigBorder" }, config.scenePositions["4boxbig"]);
	} else if (camList.length >= 4) {
		response = await setCustomCams(controller, obsSources, "Custom Cams", camList, { "border": "4CamBorder" }, config.scenePositions["4box"]);
	} else if (camList.length >= 3 && userCommand == "customcamsbig") {
		response = await setCustomCams(controller, obsSources, "Custom Cams", camList, { "border": "4CamBigBorder" }, config.scenePositions["3boxbig"]);
	} else if (camList.length >= 3) {
		response = await setCustomCams(controller, obsSources, "Custom Cams", camList, { "border": "3CamBorder" }, config.scenePositions["3box"]);
	} else if (camList.length >= 2 && userCommand == "customcamsbig") {
		response = await setCustomCams(controller, obsSources, "Custom Cams", camList, { "border": "4CamBigBorder" }, config.scenePositions["2boxbig"]);
	} else if (camList.length >= 2 && userCommand == "customcamstl") {
		response = await setCustomCams(controller, obsSources, "Custom Cams", camList, { "border": "2CamTopleftBorder" }, config.scenePositions["2boxtl"]);
	} else if (camList.length >= 2 && userCommand == "customcamstr") {
		response = await setCustomCams(controller, obsSources, "Custom Cams", camList, { "border": "2CamToprightBorder" }, config.scenePositions["2boxtr"]);
	} else if (camList.length >= 2 && userCommand == "customcamsbl") {
		response = await setCustomCams(controller, obsSources, "Custom Cams", camList, { "border": "2CamBottomleftBorder" }, config.scenePositions["2boxbl"]);
	} else if (camList.length >= 2 && userCommand == "customcamsbr") {
		response = await setCustomCams(controller, obsSources, "Custom Cams", camList, { "border": "2CamBottomrightBorder" }, config.scenePositions["2boxbr"]);
	} else if (camList.length >= 2) {
		response = await setCustomCams(controller, obsSources, "Custom Cams", camList, { "border": "2CamBorder" }, config.scenePositions["2box"]);
	} else if (camList.length >= 1) {
		response = await setCustomCams(controller, obsSources, "Custom Cams", camList, { "border": "1CamBorder" }, config.scenePositions["1box"]);
	}
	if (response) {
		await controller.connections.obs.local.setScene("Custom Cams");

		if (!config.pauseCloudSceneChange) {
			setTimeout(() => {
				controller.connections.obs.cloud.setScene("Alveus Server");
			}, 500)
		}
		controller.connections.database["customcam"] = camList;
		if (userCommand == "customcamsbig") {
			controller.connections.database["customcamsbig"] = true;
		} else {
			controller.connections.database["customcamsbig"] = false;
		}
		controller.connections.database["customcamscommand"] = userCommand;
	}
}

async function setCustomCams(controller, obsSources, sceneName, camList, toggleMap, positions) {
	//skip disabling anything with "overlay" in name
	//toggle anything inside toggleMap off except the value
	try {
		let sceneItems = obsSources; //controller.connections.obs.local.sceneList || [];
		let sceneMap = {};
		for (let item of sceneItems) {
			let sourceName = item.sourceName || '';
			sourceName = sourceName.replaceAll(" ", "");
			sourceName = sourceName.toLowerCase();
			let sourceId = item.sceneItemId;
			let visibility = item.sceneItemEnabled;
			let index = item.sceneItemIndex;
			let type = item.sourceType; //'OBS_SOURCE_TYPE_SCENE'
			sceneMap[sourceName] = { sourceName, sourceId, index, visibility, type };
		}
		let indexOrder = [];
		for (let i = 0; i < camList.length; i++) {
			let pos = positions[i + 1];
			if (pos == null) {
				continue;
			}
			let cam = camList[i] || "";
			cam = cam.replaceAll(" ", "");
			cam = cam.toLowerCase();
			if (cam == "") {
				continue;
			}
			camList[i] = cam;

			let camInfo = sceneMap[cam] || {};
			let sourceId = camInfo.sourceId || "";
			let index = camInfo.index || 0;
			if (sourceId == "") {
				continue;
			}
			indexOrder.push(index);
			await controller.connections.obs.local.setSceneItemIdTransform(sceneName, sourceId, pos);
		}
		for (let item of sceneItems) {
			let sourceName = item.sourceName || '';
			sourceName = sourceName.replaceAll(" ", "");
			sourceName = sourceName.toLowerCase();
			let sourceId = item.sceneItemId;
			let visibility = item.sceneItemEnabled;
			let type = item.sourceType; //'OBS_SOURCE_TYPE_SCENE'

			//toggle off anything with baseName in it, except its value
			for (let baseName in toggleMap) {
				let base = baseName.replaceAll(" ", "");
				base = base.toLowerCase();
				let dontSkip = toggleMap[baseName];
				dontSkip = dontSkip.replaceAll(" ", "");
				dontSkip = dontSkip.toLowerCase();
				if (sourceName.includes(base)) {
					if (sourceName.includes(dontSkip)) {
						//enable
						await controller.connections.obs.local.setSceneItemIdEnabled(sceneName, sourceId, true);
					} else {
						//disable
						await controller.connections.obs.local.setSceneItemIdEnabled(sceneName, sourceId, false);
					}
				}
			}

			//only toggle scene's
			if (type != "OBS_SOURCE_TYPE_SCENE" || sourceName.includes("overlay")) {
				//skip over anything else with Overlay
				continue;
			}

			//OBS Type SCENE
			if (camList.includes(sourceName) && visibility != true) {
				//enable if its in the list
				await controller.connections.obs.local.setSceneItemIdEnabled(sceneName, sourceId, true);
			} else if (!camList.includes(sourceName) && visibility != false) {
				//disable
				await controller.connections.obs.local.setSceneItemIdEnabled(sceneName, sourceId, false);
			}

		}
		// logger.log("sceneMap",sceneMap);
		//order the cam's
		// indexOrder.reverse();
		// OBS Higher number = Top of list. 0 is bottom
		//sort ascending  order
		indexOrder.sort(function (a, b) { return a - b });
		let lastindex = 0;
		for (let i = 0; i < camList.length; i++) {
			let name = camList[i];
			let camInfo = sceneMap[name] || {};
			let sourceId = camInfo.sourceId || "";
			if (sourceId == "") {
				continue;
			}
			lastindex = indexOrder[i] ?? lastindex;
			if (lastindex < 7) {
				lastindex = 7;
			}
			await controller.connections.obs.local.setSceneItemIndex(sceneName, sourceId, lastindex);
		}

		//toggle music based on cameras
		let foundMic = false;
		for (const grp in config.micGroups) {
			for (const source in config.micGroups[grp]) {
				if (source == "fox") {
					continue;
				}
				let micName = source || "";
				micName = micName.toLowerCase();
				for (let i = 0; i < camList.length; i++) {
					let camName = camList[i] || "";
					camName = camName.toLowerCase();
					if (micName != "" && camName != "" && camName.includes(micName)) {
						foundMic = true;
						break;
					}
				}
				if (foundMic) {
					break;
				}
			}
			if (foundMic) {
				break;
			}
		}

		if (!foundMic) {
			//turn on music if no camera has a mic
			controller.connections.obs.cloud.setMute(config.globalMusicSource, false);
		}
		logger.log(`setCustomCams - ${sceneName} (${camList})`);
		return true;
	} catch (e) {
		logger.log(`Error setCustomCams (${sceneName},${camList}): ${JSON.stringify(e)}`);
		return null;
	}
}

async function setPTZRoamMode(controller, scene) {
	if (controller.connections.database[scene] == null) {
		//invalid scene
		return;
	}
	let length = controller.connections.database[scene].roamTime;
	let speed = controller.connections.database[scene].roamSpeed;
	let list = controller.connections.database[scene].roamList;
	if (length == null || isNaN(parseInt(length)) || list == null || list.length <= 1) {
		//do nothing if only 1 position or less
		return;
	}
	let camera = controller.connections.cameras[scene] || null;
	if (camera == null) {
		//cant find camera client
		return;
	}
	if (!isNaN(parseFloat(speed))) {
		//set speed
		camera.setSpeed(speed);
	}

	if (!controller.connections.database[scene].isRoaming) {
		//stop roaming
		let currentSpeed = await camera.getSpeed();
		let oldSpeed = controller.connections.database[scene].speed;
		if (oldSpeed != currentSpeed) {
			camera.setSpeed(oldSpeed);
		}
		return;
	}


	let currentIndex = controller.connections.database[scene].roamIndex;
	if (currentIndex == null) {
		currentIndex = -1;
	}
	let currentDirection = controller.connections.database[scene].roamDirection || "forward";

	if (currentDirection == "forward") {
		//increment forward
		currentIndex++;
		if (currentIndex >= list.length) {
			currentDirection = "reverse";
			currentIndex = list.length - 2 || 0;
		}
	} else if (currentDirection == "reverse") {
		//increment reverse
		currentIndex--;
		if (currentIndex < 0) {
			currentDirection = "forward";
			if (currentIndex < -1) {
				currentIndex = 0;
			} else {
				currentIndex = 1;
			}

		}
	}
	controller.connections.database[scene].roamIndex = currentIndex;
	controller.connections.database[scene].roamDirection = currentDirection;

	//change position
	let newPosition = list[currentIndex];
	let preset = controller.connections.database[scene].presets[newPosition];
	// logger.log("Roam preset",list,currentIndex,newPosition);
	if (preset != null) {
		camera.ptz({ pan: preset.pan, tilt: preset.tilt, zoom: preset.zoom, focus: preset.focus, autofocus: preset.autofocus });
	}
	roamTimeout = setTimeout(setPTZRoamMode, length * 1000, controller, scene);
}

function runAtSpecificTimeOfDay(hour, minutes, func) {
	const twentyFourHours = 86400000;
	const now = new Date();
	let eta_ms = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hour, minutes, 0, 0).getTime() - now;
	if (eta_ms < 0) {
		eta_ms += twentyFourHours;
	}
	setTimeout(function () {
		//run once
		func();
		// run every 24 hours from now on
		setInterval(func, twentyFourHours);
	}, eta_ms);
}
