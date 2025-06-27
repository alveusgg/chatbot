'use strict';

module.exports = (controller, camera) => {
	let camStatus = controller.connections.database.lockoutPTZ[camera];
	if (camStatus) {
		//permanent lockout
		if (camStatus.duration == 0) {
			return false;
		}
		//check if time is finished
		let now = new Date();
		let before = camStatus.timestamp;
		if (before != null) {
			let differenceMS = now.getTime() - before.getTime();
			if (differenceMS < camStatus.duration * 1000) {
				return false;
			} else {
				delete controller.connections.database.lockoutPTZ[camera];
				return true;
			}
		}
	} else {
		return true;
	}
}
