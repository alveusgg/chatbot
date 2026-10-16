const { readFile } = require('node:fs/promises');
const { randomUUID } = require('node:crypto');

class PresetServiceError extends Error {
    constructor(message, { code = 'UNAVAILABLE', transient = false, id } = {}) {
        super(message);
        this.name = 'PresetServiceError';
        this.code = code;
        this.transient = transient;
        this.id = id;
    }
}

const sleep = (milliseconds) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds));

class WebsitePresets {
    constructor({
        siteUrl = process.env.PRESETS_SITE_URL,
        keyFile = process.env.PRESETS_SITE_KEY_FILE,
        fetch = globalThis.fetch,
        requestTimeout = 5000,
        operationTimeout = 15000,
        retryDelay = 200,
        pollInterval = 300,
    } = {}) {
        this.siteUrl = siteUrl;
        this.keyFile = keyFile;
        this.fetch = fetch;
        this.requestTimeout = requestTimeout;
        this.operationTimeout = operationTimeout;
        this.retryDelay = retryDelay;
        this.pollInterval = pollInterval;
    }

    async request(procedure, input, mutation, deadline) {
        let base;
        let key;
        try {
            base = new URL(this.siteUrl);
            const local = ['localhost', '127.0.0.1', '[::1]'].includes(
                base.hostname,
            );
            if (
                (base.protocol !== 'https:' &&
                    !(local && base.protocol === 'http:')) ||
                base.username ||
                base.password ||
                base.pathname !== '/' ||
                base.search ||
                base.hash ||
                !this.keyFile
            ) {
                throw new Error();
            }
            key = (await readFile(this.keyFile, 'utf8')).trim();
            if (!key || /[\r\n]/.test(key)) throw new Error();
        } catch {
            throw new PresetServiceError(
                'Website presets are not configured. Set PRESETS_SITE_URL and PRESETS_SITE_KEY_FILE.',
                { code: 'CONFIGURATION' },
            );
        }
        const remaining = deadline - Date.now();
        if (remaining <= 0)
            throw new PresetServiceError('Website preset request timed out.', {
                transient: true,
            });
        const url = new URL(`/api/trpc/presets.${procedure}`, base);
        const serialized = JSON.stringify({ json: input });
        if (!mutation) url.searchParams.set('input', serialized);
        let response;
        let data;
        try {
            response = await this.fetch(url, {
                method: mutation ? 'POST' : 'GET',
                headers: {
                    Authorization: `ApiKey ${key}`,
                    'Content-Type': 'application/json',
                },
                ...(mutation ? { body: serialized } : {}),
                redirect: 'error',
                signal: AbortSignal.timeout(
                    Math.max(1, Math.min(this.requestTimeout, remaining)),
                ),
            });
        } catch {
            throw new PresetServiceError(
                'Website preset service is unavailable.',
                { transient: true },
            );
        }
        if (!response.ok) {
            // Error bodies may contain private server details. Status is enough
            // for retry/auth decisions; do not consume or expose those bodies.
            await response.body?.cancel().catch(() => {});
            const status = response.status;
            const transient = [408, 425, 429, 500, 502, 503, 504].includes(
                status,
            );
            throw new PresetServiceError(
                status === 401 || status === 403
                    ? 'Website preset service authentication was refused.'
                    : 'Website preset request was refused.',
                {
                    transient,
                    code:
                        status === 401 || status === 403
                            ? 'AUTHENTICATION'
                            : 'REFUSED',
                },
            );
        }
        try {
            // Read the body under the same AbortSignal deadline as the headers.
            data = await response.json();
        } catch {
            throw new PresetServiceError(
                'Website preset service returned an invalid response.',
                { transient: true },
            );
        }
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            throw new PresetServiceError(
                'Website preset service returned an invalid response.',
                { transient: true },
            );
        }
        if (data.error)
            throw new PresetServiceError(
                'Website preset request was refused.',
                { code: 'REFUSED' },
            );
        if (
            !data.result?.data ||
            !Object.prototype.hasOwnProperty.call(data.result.data, 'json')
        ) {
            throw new PresetServiceError(
                'Website preset service returned an invalid response.',
                { transient: true },
            );
        }
        return data.result.data.json;
    }

    async retry(procedure, input, mutation, deadline) {
        for (let attempt = 0; ; attempt++) {
            try {
                return await this.request(procedure, input, mutation, deadline);
            } catch (error) {
                if (
                    !error.transient ||
                    attempt >= 2 ||
                    Date.now() + this.retryDelay >= deadline
                )
                    throw error;
                await sleep(this.retryDelay * (attempt + 1));
            }
        }
    }

    async catalog(camera) {
        const entries = await this.retry(
            'catalog',
            camera ? { camera } : {},
            false,
            Date.now() + this.operationTimeout,
        );
        if (
            !Array.isArray(entries) ||
            entries.some(
                (entry) =>
                    !entry ||
                    typeof entry.camera !== 'string' ||
                    typeof entry.name !== 'string' ||
                    !entry.position ||
                    ['pan', 'tilt', 'zoom'].some(
                        (field) => !Number.isFinite(entry.position[field]),
                    ) ||
                    (entry.position.focus != null &&
                        !Number.isFinite(entry.position.focus)) ||
                    (entry.position.autofocus != null &&
                        !['on', 'off'].includes(entry.position.autofocus)),
            )
        ) {
            throw new PresetServiceError('Website preset catalog is invalid.');
        }
        // The caller receives canonical website data only. There is no local preset fallback.
        return entries;
    }

    async command({ id = randomUUID(), ...input }) {
        const deadline = Date.now() + this.operationTimeout;
        let operation;
        try {
            operation = await this.retry(
                'command',
                { id, ...input },
                true,
                deadline,
            );
        } catch (error) {
            if (!error.transient) throw error;
            // The command may already have reached the worker. Recover by its
            // original id, never by issuing a new command or directly moving a camera.
        }
        while (Date.now() < deadline) {
            if (operation) {
                if (
                    operation.id !== id ||
                    !['pending', 'completed', 'failed'].includes(
                        operation.status,
                    )
                ) {
                    operation = undefined;
                } else if (operation.status !== 'pending') return operation;
            }
            await sleep(
                Math.min(this.pollInterval, Math.max(0, deadline - Date.now())),
            );
            try {
                operation = await this.retry(
                    'operation',
                    { id },
                    false,
                    deadline,
                );
            } catch (error) {
                if (
                    error.code === 'AUTHENTICATION' ||
                    error.code === 'CONFIGURATION'
                )
                    break;
                operation = undefined;
            }
        }
        return { id, status: 'pending', unknown: true };
    }
}

module.exports = { WebsitePresets, PresetServiceError };
