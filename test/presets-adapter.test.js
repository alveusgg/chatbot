const { test } = require('node:test');
const assert = require('node:assert/strict');
const legacy = require('../src/modules/legacy');
const { loadPreset, actorFor } = require('../src/services/ptz-presets');

const position = {
    pan: 12,
    tilt: -7,
    zoom: 3000,
    focus: 4000,
    autofocus: 'off',
};
const actor = { id: '1234', name: 'Operator' };

function fixture() {
    const calls = [];
    const moves = [];
    const messages = [];
    const speeds = [];
    let catalog = [
        { camera: 'garden', provenance: 'capture', name: 'home', position },
        { camera: 'garden', provenance: 'capture', name: 'fence', position },
    ];
    const presets = {
        async catalog(camera) {
            calls.push(['catalog', camera]);
            return catalog;
        },
        async command(input) {
            calls.push(['command', input]);
            return { id: 'operation-id', status: 'completed' };
        },
    };
    const camera = {
        async getPosition() {
            return position;
        },
        async ptz(input) {
            moves.push(input);
        },
        async getSpeed() {
            return 60;
        },
        setSpeed(value) {
            speeds.push(value);
        },
    };
    const seed = { seedonly: { pan: 99 } };
    const controller = {
        connections: {
            presets,
            cameras: { garden: camera },
            database: {
                garden: { presets: seed, lastKnownPosition: position },
                customcam: ['fullcamgarden'],
                lockoutPTZ: {},
                blockedUsers: {},
            },
            twitch: {
                send(...args) {
                    messages.push(args);
                },
            },
            api: {
                sendAPI(message) {
                    messages.push(['api', message]);
                },
            },
        },
    };
    const run = (name, message, scene = 'garden') =>
        legacy.checkPTZCommand(
            controller,
            name,
            { accessLevel: 'commandAdmins' },
            'mock',
            message,
            scene,
            'operator',
            actor,
        );
    return {
        controller,
        calls,
        moves,
        messages,
        speeds,
        seed,
        camera,
        presets,
        run,
        setCatalog(value) {
            catalog = value;
        },
    };
}

test('named load/home use website execution once and never bot PTZ, including normalized catalog camera aliases', async () => {
    const f = fixture();
    f.setCatalog([{ camera: 'canonical-garden', name: 'home', position }]);
    await f.run('ptzload', '!ptzload garden home');
    await f.run('ptzhome', '!ptzhome garden');
    assert.equal(f.moves.length, 0);
    const commands = f.calls
        .filter(([type]) => type === 'command')
        .map(([, value]) => value);
    assert.equal(commands.length, 2);
    for (const input of commands)
        assert.deepEqual(input, {
            action: 'load',
            camera: 'garden',
            name: 'home',
            actor,
        });
});

test('save/remove/rename/clear retain parsing and send commands without editing local preset seed', async () => {
    const f = fixture();
    const original = JSON.stringify(f.seed);
    for (const [name, message] of [
        ['ptzsave', '!ptzsave garden fence'],
        ['ptzremove', '!ptzremove garden fence'],
        ['ptzrename', '!ptzrename garden fence home'],
        ['ptzclear', '!ptzclear garden'],
        ['ptzsave', '!ptzsave garden'],
        ['ptzrename', '!ptzrename garden renamed'],
    ])
        await f.run(name, message);
    const commands = f.calls
        .filter(([type]) => type === 'command')
        .map(([, input]) => input);
    assert.deepEqual(
        commands.map((input) => input.action),
        ['save', 'remove', 'rename', 'clear', 'save', 'rename'],
    );
    assert.equal(commands[2].newName, 'home');
    assert.equal(commands[4].name, 'garden');
    assert.equal(commands[5].name, 'garden');
    assert.equal(commands[5].newName, 'renamed');
    assert.equal(JSON.stringify(f.seed), original);
    assert.equal(f.moves.length, 0);
});

test('unnamed current-scene save keeps lastKnownPosition, independent of website configuration', async () => {
    const f = fixture();
    f.controller.connections.database.garden.lastKnownPosition = null;
    await f.run('ptzsave', '!ptzsave');
    assert.deepEqual(
        f.controller.connections.database.garden.lastKnownPosition,
        position,
    );
    assert.deepEqual(f.calls, []);
});

test('lastKnownPosition fallback requires a successful canonical absence read', async () => {
    const moves = [];
    const camera = {
        ptz(input) {
            moves.push(input);
        },
    };
    const input = {
        cameraName: 'garden',
        name: 'missing',
        actor,
        camera,
        lastKnownPosition: position,
    };
    const result = await loadPreset({
        ...input,
        service: { catalog: async () => [] },
    });
    assert.equal(result.fallback, true);
    assert.deepEqual(moves, [
        { pan: position.pan, tilt: position.tilt, zoom: position.zoom },
    ]);
    await assert.rejects(
        loadPreset({
            ...input,
            service: {
                catalog: async () => {
                    throw Error('unavailable');
                },
            },
        }),
    );
    assert.equal(moves.length, 1);
});

test('pending or failed website loads never fall back or advertise success', async () => {
    const f = fixture();
    f.presets.command = async () => ({
        id: 'pending-id',
        status: 'pending',
        unknown: true,
    });
    await f.run('ptzload', '!ptzload garden home');
    assert.equal(f.moves.length, 0);
    assert.match(f.messages[0][1], /pending.*unknown.*pending-id/);
    f.presets.command = async () => ({ id: 'failed-id', status: 'failed' });
    await f.run('ptzload', '!ptzload garden home');
    assert.equal(f.moves.length, 0);
    assert.match(f.messages[1][1], /failed.*failed-id/);
});

test('preset list reads website data and leaves historical camera-list response intact', async () => {
    const f = fixture();
    await f.run('ptzlist', '!ptzlist garden');
    assert.equal(f.messages[0][1], 'PTZ Presets: fence,home');
    assert(!f.messages[0][1].includes('seedonly'));
    await f.run('ptzlist', '!ptzlist');
    assert.match(f.messages[1][1], /Current Scene: garden/);
});

test('camera lockout still prevents named website movement', async () => {
    const f = fixture();
    // The historical lockout lookup uses the original command's resolved base.
    f.controller.connections.database.lockoutPTZ.garden = {
        duration: 0,
        accessLevel: 'commandAdmins',
    };
    await legacy.checkPTZCommand(
        f.controller,
        'ptzload',
        { accessLevel: 'commandUsers' },
        'mock',
        '!ptzload gardencam home',
        'garden',
        'operator',
        actor,
    );
    assert.equal(f.calls.length, 0);
});

test('roaming uses fresh website positions and preserves direct PTZ focus/autofocus and speed', async (t) => {
    const f = fixture();
    const originalTimeout = global.setTimeout;
    t.mock.method(global, 'setTimeout', (fn, ...args) =>
        fn === legacy.setPTZRoamMode ? 1 : originalTimeout(fn, ...args),
    );
    Object.assign(f.controller.connections.database.garden, {
        isRoaming: true,
        roamTime: '10',
        roamSpeed: '20',
        roamList: ['home', 'fence'],
        roamIndex: -1,
        speed: 60,
    });
    await legacy.setPTZRoamMode(f.controller, 'garden');
    assert.deepEqual(f.moves, [position]);
    assert.deepEqual(f.speeds, ['20']);
    assert.deepEqual(f.calls, [['catalog', 'garden']]);
    f.presets.catalog = async () => {
        throw Error('unavailable');
    };
    await legacy.setPTZRoamMode(f.controller, 'garden');
    assert.equal(f.controller.connections.database.garden.isRoaming, false);
    assert.equal(f.moves.length, 1);
});

test('chat permission checks stay in front of preset service and actor uses available Twitch id', async () => {
    const f = fixture();
    f.controller.connections.obs = {
        local: { getScene: async () => 'fullcamgarden' },
    };
    f.controller.connections.database.timeRestrictionDisabled = true;
    const tags = {
        userInfo: {
            userId: 'opaque-twitch-id',
            userName: 'spacevoyage',
            displayName: 'SpaceVoyage',
        },
    };
    await legacy.onTwitchMessage(
        f.controller,
        'mock',
        'spacevoyage',
        '!ptzsave garden home',
        tags,
    );
    const submitted = f.calls.find(([type]) => type === 'command');
    assert.deepEqual(submitted[1].actor, {
        id: 'opaque-twitch-id',
        name: 'SpaceVoyage',
    });
    const before = f.calls.length;
    await legacy.onTwitchMessage(
        f.controller,
        'mock',
        'unauthorized-viewer',
        '!ptzclear garden',
        { userInfo: { userName: 'unauthorized-viewer', userId: 'viewer-id' } },
    );
    assert.equal(f.calls.length, before);
    assert.deepEqual(actorFor('opaque-api-user'), {
        id: 'opaque-api-user',
        name: 'opaque-api-user',
    });
});

test('a superseded asynchronous roaming read cannot move after a newer roaming request', async (t) => {
    const f = fixture();
    const originalTimeout = global.setTimeout;
    t.mock.method(global, 'setTimeout', (fn, ...args) =>
        fn === legacy.setPTZRoamMode ? 1 : originalTimeout(fn, ...args),
    );
    Object.assign(f.controller.connections.database.garden, {
        isRoaming: true,
        roamTime: '10',
        roamSpeed: '20',
        roamList: ['home', 'fence'],
        roamIndex: -1,
        speed: 60,
    });
    let finishOldRead;
    let count = 0;
    f.presets.catalog = () =>
        ++count === 1
            ? new Promise((resolve) => {
                  finishOldRead = resolve;
              })
            : Promise.resolve([{ camera: 'garden', provenance: 'capture', name: 'home', position }]);
    const old = legacy.setPTZRoamMode(f.controller, 'garden');
    await legacy.setPTZRoamMode(f.controller, 'garden');
    finishOldRead([
        { camera: 'garden', provenance: 'capture', name: 'home', position: { ...position, pan: 99 } },
    ]);
    await old;
    assert.deepEqual(f.moves, [position]);
});

test('home-all checks each target lockout and preserves privileged override hierarchy', async () => {
    const f = fixture();
    f.controller.connections.cameras.fox = f.camera;
    f.controller.connections.database.fox = {};
    f.controller.connections.database.customcam = ['fullcamgarden', 'fullcamfox'];
    f.controller.connections.database.lockoutPTZ.fox = { duration: 0, accessLevel: 'commandAdmins' };
    const run = (accessLevel) => legacy.checkPTZCommand(f.controller, 'ptzload', { accessLevel }, 'mock', '!ptzload home all', 'garden', 'operator', actor);
    await run('commandOperator');
    assert.deepEqual(f.calls.filter(([type]) => type === 'command').map(([, input]) => input.camera), ['garden']);
    await run('commandAdmins');
    assert.deepEqual(f.calls.filter(([type]) => type === 'command').map(([, input]) => input.camera), ['garden', 'garden', 'fox']);
    assert.equal(f.moves.length, 0);
});

test('stored roaming lists never load legacy or unknown catalog rows and omit absent optical fields', async (t) => {
    const f = fixture();
    const originalTimeout = global.setTimeout;
    t.mock.method(global, 'setTimeout', (fn, ...args) => fn === legacy.setPTZRoamMode ? 1 : originalTimeout(fn, ...args));
    Object.assign(f.controller.connections.database.garden, {isRoaming:true,roamTime:'10',roamSpeed:'20',roamList:['home','fence'],roamIndex:-1,speed:60});
    for (const provenance of ['legacy', 'unknown', undefined]) {
        f.controller.connections.database.garden.roamIndex = -1;
        f.setCatalog([{camera:'garden',name:'home',provenance,position}]);
        await legacy.setPTZRoamMode(f.controller,'garden');
    }
    assert.equal(f.moves.length,0);
    f.controller.connections.database.garden.roamIndex=-1;
    const bare={pan:1,tilt:2,zoom:3};
    f.setCatalog([{camera:'garden',name:'home',provenance:'control-api-import',position:bare}]);
    await legacy.setPTZRoamMode(f.controller,'garden');
    assert.deepEqual(f.moves,[bare]);
});

test('a later roam-off command cannot be undone by an older pending roam configuration', async (t) => {
    const f=fixture();
    const originalTimeout=global.setTimeout;
    t.mock.method(global,'setTimeout',(fn,...args)=>fn===legacy.setPTZRoamMode?1:originalTimeout(fn,...args));
    let finishRead, started;
    const reading=new Promise(resolve=>{started=resolve;});
    const catalog=[{camera:'garden',name:'home',provenance:'capture',position},{camera:'garden',name:'fence',provenance:'capture',position}];
    let calls=0;
    f.presets.catalog=()=>++calls===1?new Promise(resolve=>{finishRead=resolve;started();}):Promise.resolve(catalog);
    const old=f.run('ptzroam','!ptzroam garden 10 20 home fence');
    await reading;
    await f.run('ptzroam','!ptzroam garden off');
    finishRead(catalog);
    await old;
    assert.equal(f.controller.connections.database.garden.isRoaming,false);
    assert.equal(f.moves.length,0);
});

test('roam configuration excludes archival positions from the saved list', async (t) => {
    const f=fixture();
    const originalTimeout=global.setTimeout;
    t.mock.method(global,'setTimeout',(fn,...args)=>fn===legacy.setPTZRoamMode?1:originalTimeout(fn,...args));
    f.setCatalog([{camera:'garden',name:'home',provenance:'legacy',position},{camera:'garden',name:'fence',provenance:'capture',position}]);
    await f.run('ptzroam','!ptzroam garden 10 20 home fence');
    assert.deepEqual(f.controller.connections.database.garden.roamList,['fence']);
    assert.equal(f.moves.length,0);
});
