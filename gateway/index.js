import express from 'express';
import dotenv from 'dotenv';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

dotenv.config();

const DEFAULT_PORT = 8080;
const DEFAULT_TOKEN_REFRESH_MARGIN_SECONDS = 30;
const DEFAULT_REQUEST_TIMEOUT_MS = 30000;
const DEFAULT_BODY_LIMIT = '25mb';

const HOP_BY_HOP_HEADERS = new Set(['connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization', 'te', 'trailer', 'transfer-encoding', 'upgrade']);
const RESPONSE_HEADERS_TO_SKIP = new Set(['content-encoding', 'content-length']);

function getRequiredEnv(env, name) {
    const value = env[name];
    if (!value) {
        throw new Error(`${name} is required`);
    }

    return value;
}

function getRequestId(req) {
    const existingRequestId = req.get('x-request-id');
    if (existingRequestId) {
        return existingRequestId;
    }

    return randomUUID();
}

function safeEqual(actual, expected) {
    if (!actual || !expected) {
        return false;
    }

    return actual === expected;
}

export function validateGatewayCredentials(req, env) {
    if ((env.GATEWAY_AUTH_MODE || 'oidc') !== 'static') {
        return null;
    }

    if (!env.GATEWAY_CLIENT_ID || !env.GATEWAY_CLIENT_SECRET) {
        return { statusCode: 500, message: 'Gateway authentication is not configured' };
    }

    const clientId = req.get('x-client-id');
    const clientSecret = req.get('x-client-secret');

    if (!clientId || !clientSecret) {
        return { statusCode: 401, message: 'Gateway authentication required' };
    }

    if (!safeEqual(clientId, env.GATEWAY_CLIENT_ID) || !safeEqual(clientSecret, env.GATEWAY_CLIENT_SECRET)) {
        return { statusCode: 401, message: 'Invalid gateway credentials' };
    }

    return null;
}

export async function getTargetAuthHeaders(env, tokenProvider) {
    if ((env.TARGET_API_AUTH_MODE || 'oidc') === 'static') {
        return {
            'x-client-id': getRequiredEnv(env, 'TARGET_API_CLIENT_ID'),
            'x-client-secret': getRequiredEnv(env, 'TARGET_API_CLIENT_SECRET'),
        };
    }

    return {
        authorization: `Bearer ${await tokenProvider()}`,
    };
}

function getForwardHeaders(req, authHeaders, requestId) {
    const headers = new Headers();

    for (const [name, value] of Object.entries(req.headers)) {
        const normalizedName = name.toLowerCase();
        if (HOP_BY_HOP_HEADERS.has(normalizedName) || normalizedName === 'host' || normalizedName === 'authorization' || normalizedName === 'content-length' || normalizedName === 'x-client-id' || normalizedName === 'x-client-secret') {
            continue;
        }

        if (Array.isArray(value)) {
            headers.set(name, value.join(', '));
        } else if (value !== undefined) {
            headers.set(name, value);
        }
    }

    for (const [name, value] of Object.entries(authHeaders)) {
        headers.set(name, value);
    }

    headers.set('x-request-id', requestId);

    return headers;
}

function getResponseHeaders(upstreamHeaders) {
    const headers = {};

    upstreamHeaders.forEach((value, name) => {
        const normalizedName = name.toLowerCase();
        if (!HOP_BY_HOP_HEADERS.has(normalizedName) && !RESPONSE_HEADERS_TO_SKIP.has(normalizedName)) {
            headers[name] = value;
        }
    });

    return headers;
}

function isBodyAllowed(method) {
    return method !== 'GET' && method !== 'HEAD';
}

async function readClientSecret(env) {
    if (env.OIDC_CLIENT_SECRET_FILE) {
        const secret = await readFile(env.OIDC_CLIENT_SECRET_FILE, 'utf8');
        return secret.trim();
    }

    return getRequiredEnv(env, 'OIDC_CLIENT_SECRET');
}

export function createTokenProvider({ env = process.env, fetchImpl = fetch, now = () => Date.now() } = {}) {
    let cachedToken = null;
    let expiresAt = 0;

    return async function getAccessToken() {
        const refreshMarginMs = Number(env.TOKEN_REFRESH_MARGIN_SECONDS || DEFAULT_TOKEN_REFRESH_MARGIN_SECONDS) * 1000;
        if (cachedToken && now() < expiresAt - refreshMarginMs) {
            return cachedToken;
        }

        const tokenUrl = getRequiredEnv(env, 'OIDC_TOKEN_URL');
        const clientId = getRequiredEnv(env, 'OIDC_CLIENT_ID');
        const clientSecret = await readClientSecret(env);
        const body = new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
        });

        if (env.OIDC_SCOPE) {
            body.set('scope', env.OIDC_SCOPE);
        }

        const response = await fetchImpl(tokenUrl, {
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
            },
            body,
        });

        if (!response.ok) {
            throw new Error(`Token endpoint returned ${response.status}`);
        }

        const payload = await response.json();
        if (!payload.access_token) {
            throw new Error('Token endpoint response is missing access_token');
        }

        cachedToken = payload.access_token;
        expiresAt = now() + Number(payload.expires_in || 60) * 1000;

        return cachedToken;
    };
}

export function createGatewayApp({ env = process.env, fetchImpl = fetch, tokenProvider = createTokenProvider({ env, fetchImpl }) } = {}) {
    const app = express();
    const targetApiUrl = getRequiredEnv(env, 'TARGET_API_URL').replace(/\/$/, '');
    const requestTimeoutMs = Number(env.GATEWAY_REQUEST_TIMEOUT_MS || DEFAULT_REQUEST_TIMEOUT_MS);

    app.get('/health', (_req, res) => {
        res.json({ message: 'ok' });
    });

    app.use(
        express.raw({
            type: () => true,
            limit: env.GATEWAY_BODY_LIMIT || DEFAULT_BODY_LIMIT,
        })
    );

    app.use(async (req, res) => {
        const requestId = getRequestId(req);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

        try {
            const gatewayAuthError = validateGatewayCredentials(req, env);
            if (gatewayAuthError) {
                return res.status(gatewayAuthError.statusCode).json({ message: gatewayAuthError.message, requestId });
            }

            const authHeaders = await getTargetAuthHeaders(env, tokenProvider);
            const upstreamUrl = `${targetApiUrl}${req.originalUrl}`;
            const upstreamResponse = await fetchImpl(upstreamUrl, {
                method: req.method,
                headers: getForwardHeaders(req, authHeaders, requestId),
                body: isBodyAllowed(req.method) ? req.body : undefined,
                signal: controller.signal,
            });

            res.status(upstreamResponse.status).set(getResponseHeaders(upstreamResponse.headers));

            if (req.method === 'HEAD' || upstreamResponse.status === 204 || upstreamResponse.status === 304) {
                return res.end();
            }

            const responseBody = Buffer.from(await upstreamResponse.arrayBuffer());
            return res.send(responseBody);
        } catch (error) {
            const statusCode = error.name === 'AbortError' ? 504 : 502;
            console.error(`Gateway request failed: ${error.message}`);
            return res.status(statusCode).json({ message: 'API gateway upstream request failed', requestId });
        } finally {
            clearTimeout(timeout);
        }
    });

    return app;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    const port = process.env.GATEWAY_PORT || process.env.PORT || DEFAULT_PORT;
    createGatewayApp().listen(port, () => {
        console.log(`Library API gateway ready on http://localhost:${port}`);
    });
}
