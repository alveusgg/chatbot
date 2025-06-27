'use strict';

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { database, twitch } }) => {
    return {
        name: 'listlocked',
        aliases: ["listlock","lockedlist","locklist","getlocked","lockstatus","lockedstatus","lockedcams"],
        enabled: !!database,
        permission: {
            // TODO
            group: 'operator'
        },
        run: ({ channel }) => {
			const lockedcamlist = [...new Set([...Object.keys(database.lockoutCams), ...Object.keys(database.lockoutPTZ)])]
			let lockedouput = "";
			for (let camName of lockedcamlist) {
				let ptz = database.lockoutPTZ[camName];
				let ptztext = "";
				let camtext = "";
				if (ptz) {
					let ptzPermission = ptz.accessLevel;
					if (ptzPermission == "commandAdmins" || ptzPermission == "commandSuperUsers") {
						ptztext = "ptz[S]";
					} else {
						ptztext = "ptz";
					}
				}
				let cam = database.lockoutCams[camName];
				if (cam) {
					let camPermission = cam.accessLevel;
					if (camPermission == "commandAdmins" || camPermission == "commandSuperUsers") {
						camtext = `cam[S]`
					} else {
						camtext = `cam`
					}
				}
				if (ptztext && camtext) {
					lockedouput += `${camName}(${camtext}|${ptztext}), `
				} else if (ptztext) {
					lockedouput += `${camName}(${ptztext}), `
				} else if (camtext) {
					lockedouput += `${camName}(${camtext}), `
				}
			}
			twitch.send(channel, `Locked Cams: ${lockedouput}`);
        }
    }
}
