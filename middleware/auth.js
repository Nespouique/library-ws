import { createRemoteJWKSet, jwtVerify } from 'jose';
import { timingSafeEqual } from 'node:crypto';

const DEFAULT_READ_SCOPE = 'library:read';
const DEFAULT_WRITE_SCOPE = 'library:write';
const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function isAuthEnabled(env) {
    return env.AUTH_ENABLED === 'true';
}

function getAuthMode(env) {
    return env.AUTH_MODE || 'oidc';
}

function safeEqual(actual, expected) {
    if (!actual || !expected) {
        return false;
    }

    const actualBuffer = Buffer.from(actual);
    const expectedBuffer = Buffer.from(expected);

    if (actualBuffer.length !== expectedBuffer.length) {
        return false;
    }

    return timingSafeEqual(actualBuffer, expectedBuffer);
}

function getRequiredScope(method, env) {
    if (READ_METHODS.has(method)) {
        return env.OIDC_REQUIRED_READ_SCOPE || DEFAULT_READ_SCOPE;
    }

    return env.OIDC_REQUIRED_WRITE_SCOPE || DEFAULT_WRITE_SCOPE;
}

function extractBearerToken(authorizationHeader) {
    if (!authorizationHeader) {
        return null;
    }

    const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
    return match ? match[1] : null;
}

function extractScopes(payload) {
    const scopes = new Set();

    if (typeof payload.scope === 'string') {
        for (const scope of payload.scope.split(/\s+/)) {
            if (scope) {
                scopes.add(scope);
            }
        }
    }

    if (Array.isArray(payload.scp)) {
        for (const scope of payload.scp) {
            if (typeof scope === 'string' && scope) {
                scopes.add(scope);
            }
        }
    }

    return scopes;
}

function createJsonResponse(res, statusCode, message) {
    return res.status(statusCode).json({ message });
}

function validateStaticCredentials(req, env) {
    if (!env.API_CLIENT_ID || !env.API_CLIENT_SECRET) {
        return { statusCode: 500, message: 'Authentication is not configured' };
    }

    const clientId = req.headers?.['x-client-id'];
    const clientSecret = req.headers?.['x-client-secret'];

    if (!clientId || !clientSecret) {
        return { statusCode: 401, message: 'Authentication required' };
    }

    if (!safeEqual(clientId, env.API_CLIENT_ID) || !safeEqual(clientSecret, env.API_CLIENT_SECRET)) {
        return { statusCode: 401, message: 'Invalid credentials' };
    }

    return null;
}

function createJwks(env, jwksFactory) {
    if (!env.OIDC_JWKS_URI) {
        return null;
    }

    return jwksFactory(new URL(env.OIDC_JWKS_URI));
}

export function createOidcAuthMiddleware({ env = process.env, jwtVerifier = jwtVerify, jwksFactory = createRemoteJWKSet } = {}) {
    let jwks;

    return async function oidcAuthMiddleware(req, res, next) {
        if (!isAuthEnabled(env)) {
            return next();
        }

        if (getAuthMode(env) === 'static') {
            const error = validateStaticCredentials(req, env);
            if (error) {
                return createJsonResponse(res, error.statusCode, error.message);
            }

            req.auth = {
                clientId: req.headers['x-client-id'],
                mode: 'static',
            };

            return next();
        }

        if (!env.OIDC_ISSUER_URL || !env.OIDC_JWKS_URI || !env.OIDC_AUDIENCE) {
            return createJsonResponse(res, 500, 'Authentication is not configured');
        }

        const token = extractBearerToken(req.headers?.authorization);
        if (!token) {
            return createJsonResponse(res, 401, 'Authentication required');
        }

        try {
            jwks ||= createJwks(env, jwksFactory);

            const { payload } = await jwtVerifier(token, jwks, {
                issuer: env.OIDC_ISSUER_URL,
                audience: env.OIDC_AUDIENCE,
            });

            const requiredScope = getRequiredScope(req.method, env);
            const scopes = extractScopes(payload);

            if (!scopes.has(requiredScope)) {
                return createJsonResponse(res, 403, 'Insufficient scope');
            }

            req.auth = {
                payload,
                scopes,
            };

            return next();
        } catch {
            return createJsonResponse(res, 401, 'Invalid token');
        }
    };
}

export { extractScopes, getRequiredScope };
