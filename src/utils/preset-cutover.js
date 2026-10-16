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

function ignoreLegacyPresetCommand(command) {
    return retiredPresetCommands.has(command);
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

module.exports = { ignoreLegacyPresetCommand, disableLegacyPresetRoaming };
