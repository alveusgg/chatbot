'use strict';

const getCurrentScene = require('../utils/getCurrentScene.js');
const ptzCommandSetup = require('../utils/ptzCommandSetup.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({
    connections: { api, obs, obsBot, cameras, database, twitch },
}) => {
    return {
        name: 'ptzload',
        aliases: ['ptzhome'],
        enabled: !!api && !!obs && !!cameras && !!database,
        permission: {
            group: 'vip',
        },
        run: async ({ channel, user, args: _args }) => {
            if (_args[0] === 'ptzhome' && getCurrentScene() === 'nuthouse') {
                obsBot.resetPosition();
            } else {
                const { args, camera, specificCamera, currentScene } =
                    ptzCommandSetup(obs, cameras, database, _args);

                if (args[0] === 'ptzhome') {
                    args[1] = 'home';
                }

                if (args[2] === 'all') {
                    const currentCamList = database['customcam'];

                    for (let cam of currentCamList) {
                        const preset = database[cam].presets['home'];

                        if (preset) {
                            camera.ptz({
                                pan: preset.pan,
                                tilt: preset.tilt,
                                zoom: preset.zoom,
                                focus: preset.focus,
                                autofocus: preset.autofocus,
                            });
                        }
                    }
                } else if (specificCamera) {
                    if (args[1] !== '') {
                        const preset =
                            database[specificCamera].presets[args[1]];

                        if (preset) {
                            camera.ptz({
                                pan: preset.pan,
                                tilt: preset.tilt,
                                zoom: preset.zoom,
                                focus: preset.focus,
                                autofocus: preset.autofocus,
                            });
                        } else if (
                            database[specificCamera].lastKnownPosition !== null
                        ) {
                            const previous =
                                database[specificCamera].lastKnownPosition;
                            camera.ptz({
                                pan: previous.pan,
                                tilt: previous.tilt,
                                zoom: previous.zoom,
                            });
                        }
                    } else {
                        const preset =
                            database[currentScene].presets[specificCamera];
                        if (preset) {
                            camera.ptz({
                                pan: preset.pan,
                                tilt: preset.tilt,
                                zoom: preset.zoom,
                                focus: preset.focus,
                                autofocus: preset.autofocus,
                            });
                        } else if (
                            database[currentScene].lastKnownPosition != null
                        ) {
                            const previous =
                                database[currentScene].lastKnownPosition;
                            camera.ptz({
                                pan: previous.pan,
                                tilt: previous.tilt,
                                zoom: previous.zoom,
                            });
                        }
                    }
                } else {
                    const preset = database[currentScene].presets[args[1]];
                    if (preset) {
                        camera.ptz({
                            pan: preset.pan,
                            tilt: preset.tilt,
                            zoom: preset.zoom,
                            focus: preset.focus,
                            autofocus: preset.autofocus,
                        });
                    } else if (
                        database[currentScene].lastKnownPosition != null
                    ) {
                        const previous =
                            database[currentScene].lastKnownPosition;
                        camera.ptz({
                            pan: previous.pan,
                            tilt: previous.tilt,
                            zoom: previous.zoom,
                        });
                    }
                }

                if (channel === 'ptzapi') {
                    twitch.send(
                        channel,
                        `${user}: ptzload ${specificCamera} ${args[1]}`,
                        true,
                    );
                }
            }
        },
    };
};
