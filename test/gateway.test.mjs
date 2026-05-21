import { describe, test, expect, jest } from '@jest/globals';
import { createTokenProvider, getTargetAuthHeaders, validateGatewayCredentials } from '../gateway/index.js';

function createTokenResponse({ token = 'access-token', expiresIn = 120 } = {}) {
    return {
        ok: true,
        json: jest.fn().mockResolvedValue({ access_token: token, expires_in: expiresIn }),
    };
}

describe('API gateway token provider', () => {
    test('requests a client credentials token and caches it', async () => {
        let currentTime = 1000;
        const fetchImpl = jest.fn().mockResolvedValue(createTokenResponse());
        const getAccessToken = createTokenProvider({
            env: {
                OIDC_TOKEN_URL: 'https://auth.example.com/token',
                OIDC_CLIENT_ID: 'library-ihm',
                OIDC_CLIENT_SECRET: 'server-secret',
                OIDC_SCOPE: 'library:read library:write',
                TOKEN_REFRESH_MARGIN_SECONDS: '30',
            },
            fetchImpl,
            now: () => currentTime,
        });

        await expect(getAccessToken()).resolves.toBe('access-token');
        currentTime += 1000;
        await expect(getAccessToken()).resolves.toBe('access-token');

        expect(fetchImpl).toHaveBeenCalledTimes(1);
        expect(fetchImpl).toHaveBeenCalledWith(
            'https://auth.example.com/token',
            expect.objectContaining({
                method: 'POST',
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
            })
        );

        const body = fetchImpl.mock.calls[0][1].body;
        expect(body.get('grant_type')).toBe('client_credentials');
        expect(body.get('client_id')).toBe('library-ihm');
        expect(body.get('client_secret')).toBe('server-secret');
        expect(body.get('scope')).toBe('library:read library:write');
    });

    test('refreshes token inside the configured margin', async () => {
        let currentTime = 1000;
        const fetchImpl = jest
            .fn()
            .mockResolvedValueOnce(createTokenResponse({ token: 'first-token', expiresIn: 60 }))
            .mockResolvedValueOnce(createTokenResponse({ token: 'second-token', expiresIn: 60 }));
        const getAccessToken = createTokenProvider({
            env: {
                OIDC_TOKEN_URL: 'https://auth.example.com/token',
                OIDC_CLIENT_ID: 'library-ihm',
                OIDC_CLIENT_SECRET: 'server-secret',
                TOKEN_REFRESH_MARGIN_SECONDS: '30',
            },
            fetchImpl,
            now: () => currentTime,
        });

        await expect(getAccessToken()).resolves.toBe('first-token');
        currentTime += 31000;
        await expect(getAccessToken()).resolves.toBe('second-token');

        expect(fetchImpl).toHaveBeenCalledTimes(2);
    });
});

describe('API gateway static authentication', () => {
    test('validates incoming static client credentials', () => {
        const req = {
            get: jest.fn(name => {
                const headers = {
                    'x-client-id': 'library-front',
                    'x-client-secret': 'front-secret',
                };

                return headers[name];
            }),
        };

        const error = validateGatewayCredentials(req, {
            GATEWAY_AUTH_MODE: 'static',
            GATEWAY_CLIENT_ID: 'library-front',
            GATEWAY_CLIENT_SECRET: 'front-secret',
        });

        expect(error).toBeNull();
    });

    test('rejects invalid incoming static client credentials', () => {
        const req = {
            get: jest.fn(name => {
                const headers = {
                    'x-client-id': 'library-front',
                    'x-client-secret': 'wrong-secret',
                };

                return headers[name];
            }),
        };

        const error = validateGatewayCredentials(req, {
            GATEWAY_AUTH_MODE: 'static',
            GATEWAY_CLIENT_ID: 'library-front',
            GATEWAY_CLIENT_SECRET: 'front-secret',
        });

        expect(error).toEqual({ statusCode: 401, message: 'Invalid gateway credentials' });
    });

    test('builds static credentials for the target API', async () => {
        await expect(
            getTargetAuthHeaders(
                {
                    TARGET_API_AUTH_MODE: 'static',
                    TARGET_API_CLIENT_ID: 'library-gateway',
                    TARGET_API_CLIENT_SECRET: 'api-secret',
                },
                jest.fn()
            )
        ).resolves.toEqual({
            'x-client-id': 'library-gateway',
            'x-client-secret': 'api-secret',
        });
    });
});
