const retiredPresetCommands = new Set([
    'ptzsave',
    'ptzload',
    'ptzhome',
    'ptzhomeold',
    'ptzpreset',
    'ptzremove',
    'ptzrename',
    'ptzclear',
    'ptzlist',
    'ptzroam',
    'ptzroaminfo',
]);

const presetCutoverMessage =
    'Camera preset commands and roaming are disabled in chat. Use https://www.alveussanctuary.org/about/tech/presets for camera presets.';

function redirectPresetCommand(controller, channel, command) {
    if (!retiredPresetCommands.has(command)) return false;
    if (channel === 'ptzapi' && controller.connections.api?.sendAPI) {
        controller.connections.api.sendAPI(presetCutoverMessage);
    } else {
        controller.connections.twitch?.send(channel, presetCutoverMessage);
    }
    return true;
}

function disableLegacyPresetRoaming(database) {
    // Preserve historical JSON for archival review; never read its preset
    // positions or restore roaming after deployment of the website cutover.
    for (const state of Object.values(database ?? {})) {
        if (
            state &&
            typeof state === 'object' &&
            !Array.isArray(state) &&
            state.isRoaming
        ) {
            state.isRoaming = false;
        }
    }
}

module.exports = { redirectPresetCommand, disableLegacyPresetRoaming };
