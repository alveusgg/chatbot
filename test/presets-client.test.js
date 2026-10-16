const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { mkdtemp, writeFile, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { WebsitePresets } = require('../src/services/website-presets');

async function fixture(t, handler, options = {}) {
    const temporary = await mkdtemp(join(tmpdir(), 'chatbot-presets-test-'));
    const keyFile = join(temporary, 'key');
    await writeFile(keyFile, 'local-test-key\n', { mode: 0o600 });
    const requests = [];
    const server = createServer(async (request, response) => {
        const url = new URL(request.url, 'http://127.0.0.1');
        const chunks = [];
        for await (const chunk of request) chunks.push(chunk);
        const input = JSON.parse(
            request.method === 'POST'
                ? Buffer.concat(chunks)
                : url.searchParams.get('input'),
        );
        const call = {
            procedure: url.pathname.split('.').at(-1),
            input: input.json,
            method: request.method,
        };
        requests.push(call);
        assert.equal(request.headers.authorization, 'ApiKey local-test-key');
        const send = (value, status = 200) => {
            response.writeHead(status, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ result: { data: { json: value } } }));
        };
        await handler(call, send, response);
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    t.after(async () => {
        server.closeAllConnections();
        await new Promise((resolve) => server.close(resolve));
        await rm(temporary, { recursive: true });
    });
    return {
        requests,
        client: new WebsitePresets({
            siteUrl: `http://127.0.0.1:${server.address().port}`,
            keyFile,
            retryDelay: 2,
            pollInterval: 2,
            requestTimeout: 1000,
            operationTimeout: 1000,
            ...options,
        }),
    };
}

const command = {
    action: 'load',
    camera: 'garden',
    name: 'home',
    actor: { id: 'opaque-user' },
};
const position = { pan: 1, tilt: 2, zoom: 3, focus: 4, autofocus: 'on' };

test('native HTTP client uses authenticated tRPC/superjson envelopes and polls the same operation', async (t) => {
    const { client, requests } = await fixture(t, (call, send) => {
        if (call.procedure === 'catalog')
            send([{ camera: 'garden', name: 'home', position, version: 7 }]);
        else
            send({
                id: call.input.id,
                status: call.procedure === 'command' ? 'pending' : 'completed',
            });
    });
    const catalog = await client.catalog('garden');
    assert.equal(catalog[0].version, 7);
    const operation = await client.command(command);
    assert.equal(operation.status, 'completed');
    assert.match(operation.id, /^[a-f\d-]{36}$/);
    assert.deepEqual(
        requests.map((r) => [r.procedure, r.method]),
        [
            ['catalog', 'GET'],
            ['command', 'POST'],
            ['operation', 'GET'],
        ],
    );
    assert.equal(requests[1].input.id, requests[2].input.id);
    assert.deepEqual(requests[1].input.actor, command.actor);
});

test('a lost acknowledgement retries with one UUID and one logical camera operation', async (t) => {
    const ids = new Set();
    let submissions = 0;
    const { client, requests } = await fixture(t, (call, send) => {
        ids.add(call.input.id);
        submissions++;
        if (submissions === 1) send(null, 503);
        else send({ id: call.input.id, status: 'completed' });
    });
    assert.equal((await client.command(command)).status, 'completed');
    assert.equal(requests.length, 2);
    assert.equal(ids.size, 1);
});

test('ambiguous execution remains pending/unknown instead of submitting a new operation', async (t) => {
    const { client, requests } = await fixture(
        t,
        (call, send) => send(null, call.procedure === 'command' ? 503 : 404),
        { operationTimeout: 60 },
    );
    const result = await client.command(command);
    assert.equal(result.status, 'pending');
    assert.equal(result.unknown, true);
    assert.equal(new Set(requests.map((r) => r.input.id)).size, 1);
    assert.equal(requests.filter((r) => r.procedure === 'command').length, 3);
});

test('authentication errors fail clearly without echoing server bodies or credentials', async (t) => {
    const { client, requests } = await fixture(t, (_, __, response) => {
        response.writeHead(403, { 'Content-Type': 'application/json' });
        response.end(
            JSON.stringify({
                error: { message: 'private-server-detail local-test-key' },
            }),
        );
    });
    await assert.rejects(
        client.command(command),
        (error) =>
            error.code === 'AUTHENTICATION' &&
            !error.message.includes('private-server-detail') &&
            !error.message.includes('local-test-key'),
    );
    assert.equal(requests.length, 1);
});

test('request deadlines bound stalled headers and recovery never replays with a new id', async (t) => {
    const { client, requests } = await fixture(t, () => {}, {
        requestTimeout: 15,
        operationTimeout: 90,
    });
    const started = Date.now();
    const result = await client.command(command);
    assert.equal(result.status, 'pending');
    assert.equal(new Set(requests.map((r) => r.input.id)).size, 1);
    assert(Date.now() - started < 1000);
});

test('malformed catalog data is rejected rather than treated as preset absence', async (t) => {
    const { client } = await fixture(t, (_, send) =>
        send([
            { camera: 'garden', name: 'home', position: { pan: 'invalid' } },
        ]),
    );
    await assert.rejects(client.catalog('garden'), /catalog is invalid/);
});

test('missing configuration is lazy and does not cause unrelated bot startup to fail', async () => {
    const client = new WebsitePresets({
        siteUrl: undefined,
        keyFile: undefined,
    });
    await assert.rejects(client.catalog('garden'), { code: 'CONFIGURATION' });
});

test('redirects never forward the shared credential to another endpoint', async (t) => {
    let reached = false;
    const target = createServer((_, response) => {
        reached = true;
        response.end('{}');
    });
    await new Promise((resolve) => target.listen(0, '127.0.0.1', resolve));
    t.after(() => new Promise((resolve) => target.close(resolve)));
    const { client } = await fixture(t, (_, __, response) => {
        response.writeHead(307, {
            Location: `http://127.0.0.1:${target.address().port}/credential-target`,
        });
        response.end();
    });
    await assert.rejects(client.catalog('garden'));
    assert.equal(reached, false);
});

test('invalid operation acknowledgements are recovered as unknown, not reported as execution failure', async (t) => {
    const { client, requests } = await fixture(
        t,
        (_, send) => send({ id: 'wrong-id', status: 'completed' }),
        { operationTimeout: 45 },
    );
    const result = await client.command(command);
    assert.equal(result.status, 'pending');
    assert.equal(result.unknown, true);
    assert.equal(requests.filter((r) => r.procedure === 'command').length, 1);
});

test('a non-JSON authentication response is definitive and never retries a command', async (t) => {
    const { client, requests } = await fixture(t, (_, __, response) => {
        response.writeHead(401);
        response.end('private error body');
    });
    await assert.rejects(client.command(command), { code: 'AUTHENTICATION' });
    assert.equal(requests.length, 1);
});
