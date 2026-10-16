const { WebsitePresets } = require('./website-presets');

function isLoadablePreset(preset) {
    return preset && ['capture', 'control-api-import'].includes(preset.provenance);
}

function serviceFor(controller) {
    return (controller.connections.presets ??= new WebsitePresets());
}

function actorFor(user) {
    if (typeof user === 'string' && user) return { id: user, name: user };
    if (user && typeof user.id === 'string' && user.id) {
        return {
            id: user.id,
            ...(typeof user.name === 'string' ? { name: user.name } : {}),
        };
    }
    throw new Error('A preset command requires an actor.');
}

async function loadPreset({
    service,
    cameraName,
    name,
    actor,
    camera,
    lastKnownPosition,
}) {
    const catalog = await service.catalog(cameraName);
    const preset = catalog.find((entry) => entry.name === name);
    if (!preset) {
        // Only a successful canonical catalog read can establish absence. An
        // outage, invalid response or unknown command result never reaches here.
        if (lastKnownPosition) {
            await camera.ptz({
                pan: lastKnownPosition.pan,
                tilt: lastKnownPosition.tilt,
                zoom: lastKnownPosition.zoom,
            });
            return { status: 'completed', fallback: true };
        }
        return { status: 'absent' };
    }
    return service.command({ action: 'load', camera: cameraName, name, actor });
}

function feedback(result) {
    if (result.status === 'pending')
        return `Preset operation pending; completion unknown. Operation: ${result.id}`;
    if (result.status === 'failed')
        return `Preset operation failed. Operation: ${result.id}`;
    if (result.status === 'absent') return 'Preset not found on the website.';
    return null;
}

module.exports = { serviceFor, actorFor, loadPreset, feedback, isLoadablePreset };
