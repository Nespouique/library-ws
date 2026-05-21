import { describe, test, expect, jest } from '@jest/globals';
import { createOidcAuthMiddleware, extractScopes, getRequiredScope } from '../middleware/auth.js';

function createResponse() {
    return {
        statusCode: undefined,
        body: undefined,
        status: jest.fn(function (statusCode) {
            this.statusCode = statusCode;
            return this;
        }),
        json: jest.fn(function (body) {
            this.body = body;
            return this;
        }),
    };
}

function createRequest({ method = 'GET', authorization } = {}) {
    return {
        method,
        headers: authorization ? { authorization } : {},
    };
}

function createEnv(overrides = {}) {
    return {
        AUTH_ENABLED: 'true',
        OIDC_ISSUER_URL: 'https://auth.example.com/realms/library',
        OIDC_JWKS_URI: 'https://auth.example.com/realms/library/protocol/openid-connect/certs',
        OIDC_AUDIENCE: 'library-ws',
        ...overrides,
    };
}

async function runMiddleware({ req = createRequest(), env = createEnv(), jwtVerifier = jest.fn(), jwksFactory = jest.fn(() => 'jwks') } = {}) {
    const res = createResponse();
    const next = jest.fn();
    const middleware = createOidcAuthMiddleware({ env, jwtVerifier, jwksFactory });

    await middleware(req, res, next);

    return { req, res, next, jwtVerifier, jwksFactory };
}

describe('OIDC auth middleware', () => {
    test('bypasses authentication when AUTH_ENABLED is absent', async () => {
        const { next, jwtVerifier } = await runMiddleware({ env: {} });

        expect(next).toHaveBeenCalledTimes(1);
        expect(jwtVerifier).not.toHaveBeenCalled();
    });

    test('returns 401 when bearer token is missing', async () => {
        const { res, next, jwtVerifier } = await runMiddleware();

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.body).toEqual({ message: 'Authentication required' });
        expect(next).not.toHaveBeenCalled();
        expect(jwtVerifier).not.toHaveBeenCalled();
    });

    test('returns 401 when token verification fails', async () => {
        const jwtVerifier = jest.fn().mockRejectedValue(new Error('JWT expired'));
        const { res, next } = await runMiddleware({
            req: createRequest({ authorization: 'Bearer expired-token' }),
            jwtVerifier,
        });

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.body).toEqual({ message: 'Invalid token' });
        expect(next).not.toHaveBeenCalled();
    });

    test('verifies issuer and audience with the configured JWKS', async () => {
        const jwtVerifier = jest.fn().mockResolvedValue({ payload: { scope: 'library:read' } });
        const jwksFactory = jest.fn(() => 'jwks');
        const { next } = await runMiddleware({
            req: createRequest({ authorization: 'Bearer valid-token' }),
            jwtVerifier,
            jwksFactory,
        });

        expect(next).toHaveBeenCalledTimes(1);
        expect(jwksFactory).toHaveBeenCalledWith(new URL('https://auth.example.com/realms/library/protocol/openid-connect/certs'));
        expect(jwtVerifier).toHaveBeenCalledWith('valid-token', 'jwks', {
            issuer: 'https://auth.example.com/realms/library',
            audience: 'library-ws',
        });
    });

    test('returns 403 when read scope is missing on GET', async () => {
        const jwtVerifier = jest.fn().mockResolvedValue({ payload: { scope: 'library:write' } });
        const { res, next } = await runMiddleware({
            req: createRequest({ authorization: 'Bearer valid-token' }),
            jwtVerifier,
        });

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.body).toEqual({ message: 'Insufficient scope' });
        expect(next).not.toHaveBeenCalled();
    });

    test('allows GET with scope string read scope', async () => {
        const jwtVerifier = jest.fn().mockResolvedValue({ payload: { scope: 'openid library:read' } });
        const req = createRequest({ authorization: 'Bearer valid-token' });
        const { next } = await runMiddleware({ req, jwtVerifier });

        expect(next).toHaveBeenCalledTimes(1);
        expect(req.auth.payload).toEqual({ scope: 'openid library:read' });
        expect(req.auth.scopes.has('library:read')).toBe(true);
    });

    test('requires read scope for OPTIONS', async () => {
        const jwtVerifier = jest.fn().mockResolvedValue({ payload: { scope: 'library:read' } });
        const { next } = await runMiddleware({
            req: createRequest({ method: 'OPTIONS', authorization: 'Bearer valid-token' }),
            jwtVerifier,
        });

        expect(next).toHaveBeenCalledTimes(1);
    });

    test('allows POST with scp array write scope', async () => {
        const jwtVerifier = jest.fn().mockResolvedValue({ payload: { scp: ['library:write'] } });
        const { next } = await runMiddleware({
            req: createRequest({ method: 'POST', authorization: 'Bearer valid-token' }),
            jwtVerifier,
        });

        expect(next).toHaveBeenCalledTimes(1);
    });

    test('uses custom read and write scopes from environment', () => {
        const env = {
            OIDC_REQUIRED_READ_SCOPE: 'custom:read',
            OIDC_REQUIRED_WRITE_SCOPE: 'custom:write',
        };

        expect(getRequiredScope('HEAD', env)).toBe('custom:read');
        expect(getRequiredScope('OPTIONS', env)).toBe('custom:read');
        expect(getRequiredScope('DELETE', env)).toBe('custom:write');
    });

    test('extracts scopes from scope string and scp array', () => {
        const scopes = extractScopes({ scope: 'openid library:read', scp: ['library:write', ''] });

        expect(scopes.has('openid')).toBe(true);
        expect(scopes.has('library:read')).toBe(true);
        expect(scopes.has('library:write')).toBe(true);
    });
});
