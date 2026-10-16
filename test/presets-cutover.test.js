const { test } = require('node:test');
const assert = require('node:assert/strict');
const config = require('../src/config/config');
const helper = require('../src/utils/helper');
const legacy = require('../src/modules/legacy');
const {
    ignoreLegacyPresetCommand,
    disableLegacyPresetRoaming,
} = require('../src/utils/preset-cutover');

const retired = [
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
];

function disconnected() {
    const messages = [];
    const connections = {
        twitch: {
            send(channel, message) {
                messages.push([channel, message]);
            },
            checkSubscription() {
                throw Error('No remote subscription calls');
            },
        },
        api: {
            sendAPI(message) {
                messages.push(['api', message]);
            },
        },
    };
    for (const name of ['obs', 'cameras', 'database', 'presets']) {
        Object.defineProperty(connections, name, {
            get() {
                throw Error(`${name} must not be accessed`);
            },
        });
    }
    return { controller: { connections }, messages };
}

for (const command of retired) {
    test(`${command} is silently ignored before OBS/camera/database/authentication lookup`, async () => {
        const { controller, messages } = disconnected();
        for (const spelling of [command, command.toUpperCase()]) {
            const result = await legacy.onTwitchMessage(
                controller,
                'mock',
                'viewer',
                `${config.commandPrefix}${spelling} garden home`,
                undefined,
            );
            assert.equal(result, true);
        }
        assert.deepEqual(messages, []);
    });
}

test('API and direct PTZ entry points also silently ignore while disconnected', async () => {
    const { controller, messages } = disconnected();
    await legacy.onTwitchMessage(
        controller,
        'ptzapi',
        'api-user',
        `${config.commandPrefix}ptzload garden home`,
        undefined,
    );
    assert.deepEqual(messages, []);
    assert.equal(
        await legacy.checkPTZCommand(
            controller,
            'ptzpreset',
            undefined,
            'ptzapi',
        ),
        true,
    );
    assert.deepEqual(messages, []);
});

test('the existing alias parser is applied before retirement and OBS layout aliases remain available', async (t) => {
    const { controller, messages } = disconnected();
    // Current configuration has no dedicated PTZ-preset aliases. Exercise a
    // future alias through the actual parser rather than a second alias table.
    config.commandAliasConverted.cutoverloadtest = 'ptzload';
    t.after(() => delete config.commandAliasConverted.cutoverloadtest);
    assert.equal(
        helper.commandCheck(`${config.commandPrefix}cutoverloadtest`),
        'ptzload',
    );
    await legacy.onTwitchMessage(
        controller,
        'mock',
        'viewer',
        `${config.commandPrefix}cutoverloadtest garden home`,
        undefined,
    );
    assert.deepEqual(messages, []);
    for (const [alias, target] of Object.entries(
        config.commandAliasConverted,
    )) {
        if (retired.includes(target)) {
            await legacy.onTwitchMessage(
                controller,
                'mock',
                'viewer',
                `${config.commandPrefix}${alias}`,
                undefined,
            );
        }
    }
    assert.deepEqual(messages, []);
    assert.equal(
        helper.commandCheck(`${config.commandPrefix}loadpreset`),
        'camload',
    );
    assert.equal(
        helper.commandCheck(`${config.commandPrefix}removepreset`),
        'campresetremove',
    );
    assert.equal(ignoreLegacyPresetCommand('camload'), false);
    assert.equal(ignoreLegacyPresetCommand('campresetremove'), false);
});

test('manual camera controls retain their existing parsing, movements and focus behavior', async () => {
    const calls = [];
    const camera = new Proxy(
        {},
        {
            get(_, method) {
                return (...args) => calls.push([method, ...args]);
            },
        },
    );
    const controller = {
        connections: {
            cameras: { garden: camera },
            database: {
                garden: {},
                customcam: ['fullcamgarden'],
                lockoutPTZ: {},
            },
            twitch: {
                send() {
                    throw Error(
                        'Unrelated manual commands should not redirect',
                    );
                },
            },
        },
    };
    for (const [command, args, expected] of [
        ['ptzpan', '12', [['panCamera', '12'], ['enableAutoFocus']]],
        ['ptztilt', '-7', [['tiltCamera', '-7'], ['enableAutoFocus']]],
        ['ptzzoom', '125 off', [['ptz', { areazoom: '960,540,125' }]]],
        [
            'ptzset',
            '1 2 3',
            [['ptz', { rpan: '1', rtilt: '2', rzoom: 300, autofocus: 'on' }]],
        ],
        ['ptzfocus', '30', [['focusCamera', '30']]],
        ['ptzir', 'on', [['setIRCutFilter', 'off']]],
    ]) {
        calls.length = 0;
        assert.equal(
            await legacy.checkPTZCommand(
                controller,
                command,
                { accessLevel: 'commandAdmins' },
                'mock',
                `${config.commandPrefix}${command} garden ${args}`,
                'garden',
                'operator',
            ),
            true,
        );
        assert.deepEqual(calls, expected);
    }
    assert.equal(
        Object.hasOwn(controller.connections.database.garden, 'presets'),
        false,
    );
});

test('remaining chat controls still require their existing permissions', async () => {
    const { controller, messages } = disconnected();
    await legacy.onTwitchMessage(
        controller,
        'mock',
        'viewer',
        `${config.commandPrefix}ptzpan garden 12`,
        { userInfo: { userId: 'viewer-id', userName: 'viewer' } },
    );
    assert.deepEqual(messages, []);
});

test('cutover clears roaming flags for every camera without deleting history or changing camera settings', () => {
    const presetHistory = Object.freeze({
        home: Object.freeze({ pan: 10, tilt: 0, zoom: 1 }),
    });
    const database = {
        garden: {
            isRoaming: true,
            presets: presetHistory,
            roamList: ['home', 'fence'],
            speed: 60,
            lastKnownPosition: { pan: 5 },
        },
        fox: { isRoaming: false },
        customcam: ['garden'],
        unrelated: 42,
    };
    const expected = structuredClone(database);
    expected.garden.isRoaming = false;
    disableLegacyPresetRoaming(database);
    disableLegacyPresetRoaming(database);
    assert.deepEqual(database, expected);
    assert.equal(database.garden.presets, presetHistory);
    assert.doesNotThrow(() => disableLegacyPresetRoaming(undefined));
});

test('manual OBSBot control still reaches its existing handler through chat routing', async () => {
    const calls = [];
    const controller = {
        connections: {
            obs: { local: { getScene: async () => 'nuthouse' } },
            obsBot: {
                pan(value) {
                    calls.push(value);
                },
            },
            cameras: {},
            database: {
                customcam: [],
                lockoutPTZ: {},
                blockedUsers: {},
                timeRestrictionDisabled: true,
            },
            twitch: {
                send() {
                    throw Error('Manual OBSBot control must not redirect');
                },
            },
        },
    };
    await legacy.onTwitchMessage(
        controller,
        'mock',
        'spacevoyage',
        `${config.commandPrefix}ptzpan 15`,
        { userInfo: { userId: 'operator-id', userName: 'spacevoyage' } },
    );
    assert.deepEqual(calls, ['15']);
});
