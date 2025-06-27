'use strict';

const getCurrentScene = require('../utils/getCurrentScene.js');
const ptzCommand = require('../utils/ptzCommand.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = async (controller) => {
    const { connections: { obs, cameras, database } } = controller;
    let roamTimeout;

    /**
     * @param {string} scene
     */
    async function setPTZRoamMode(scene) {
        if (database[scene] === null) {
            // Invalid scene
            return;
        }

        let { length, roamSpeed: speed, roamList: list } = database[speed];
        if (
            length === null ||
            isNaN(parseInt(length)) ||
            list === null ||
            list.length < 1
        ) {
            // Do nothing if only 1 position or less
            return;
        }

        const camera = cameras[scene] || null;
        if (camera == null) {
            // Cant find camera client
            return;
        }

        if (!isNaN(parseFloat(speed))) {
            // Set speed
            camera.setSpeed(speed);
        }

        if (!database[scene].isRoaming) {
            // Stop roaming
            let currentSpeed = await camera.getSpeed();
            let oldSpeed = database[scene].speed;
            if (oldSpeed != currentSpeed) {
                camera.setSpeed(oldSpeed);
            }
            return;
        }

        let currentIndex = database[scene].roamIndex;
        if (currentIndex == null) {
            currentIndex = -1;
        }
        let currentDirection = database[scene].roamDirection || 'forward';

        if (currentDirection == 'forward') {
            // Increment forward
            currentIndex++;
            if (currentIndex >= list.length) {
                currentDirection = 'reverse';
                currentIndex = list.length - 2 || 0;
            }
        } else if (currentDirection == 'reverse') {
            // Increment reverse
            currentIndex--;
            if (currentIndex < 0) {
                currentDirection = 'forward';
                if (currentIndex < -1) {
                    currentIndex = 0;
                } else {
                    currentIndex = 1;
                }
            }
        }

        database[scene].roamIndex = currentIndex;
        database[scene].roamDirection = currentDirection;

        // Change position
        let newPosition = list[currentIndex];
        let preset = database[scene].presets[newPosition];

        if (preset != null) {
            camera.ptz({
                pan: preset.pan,
                tilt: preset.tilt,
                zoom: preset.zoom,
                focus: preset.focus,
                autofocus: preset.autofocus,
            });
        }

        roamTimeout = setTimeout(setPTZRoamMode, length * 1000, scene);
    }

    if (obs) {
        const currentScene = await getCurrentScene(obs);

        if (database?.[currentScene]?.isRoaming) {
            clearTimeout(roamTimeout);
            setPTZRoamMode(currentScene);
        }
    }

    return ptzCommand(controller, {
        name: 'ptzroam',
        enabled: true,
        permission: {
            group: 'mod',
        },
        throttling: 'ptz',
        run: async ({ rawArgs, args, camera, currentScene }) => {
            if (rawArgs.length < 4 || !camera) {
                // Invalid command
                return;
            }

            const speed = await camera.getSpeed();

            if (rawArgs.length === 2) {
                if (args[1] === 'on' || args[1] === '1' || args[1] === 'yes') {
                    database[currentScene].isRoaming = true;

                    if (speed !== null) {
                        database[currentScene].speed = speed;
                    }

                    clearTimeout(roamTimeout);
                    setPTZRoamMode(currentScene);
                } else {
                    database[currentScene].isRoaming = false;
                }

                return;
            }

            let startingListPos = 0;

            if (isNaN(parseInt(args[1]))) {
                // Invalid command
                return;
            }

            database[currentScene].roamTime = args[1];
            startingListPos = 3;

            if (!isNaN(parseFloat(args[2]))) {
                database[currentScene].roamSpeed = args[2];
                startingListPos = 4;
            }

            const ptzRoamList = [];
            for (let i = startingListPos; i < args.length; i++) {
                const position = args[i];
                if (position in database[currentScene].presets) {
                    ptzRoamList.push(position);
                }
            }

            database[currentScene].roamIndex = -1;
            database[currentScene].roamDirection = 'forward';
            database[currentScene].roamList = JSON.parse(
                JSON.stringify(ptzRoamList),
            );
            database[currentScene].isRoaming = true;

            if (speed !== null) {
                database[currentScene].speed = speed;
            }

            clearTimeout(roamTimeout);
            await setPTZRoamMode(currentScene);
        },
    });
};
