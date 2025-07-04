// ESLint configuration for Library Web Service API
import prettierConfig from 'eslint-config-prettier';

export default [
    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                console: 'readonly',
                process: 'readonly',
                Buffer: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                global: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
            },
        },
        rules: {
            // Error Prevention
            'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            'no-console': 'off', // Allow console.log for API logging
            'no-undef': 'error',

            // Code Quality
            eqeqeq: 'error', // Require === instead of ==
            'no-var': 'error', // Require let/const instead of var
            'prefer-const': 'error', // Prefer const when variable is never reassigned

            // ES6+
            'no-duplicate-imports': 'error',
        },
    },
    {
        // Test files configuration
        files: ['test/**/*.mjs', 'test/**/*.js'],
        languageOptions: {
            globals: {
                describe: 'readonly',
                test: 'readonly',
                expect: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
                jest: 'readonly',
            },
        },
        rules: {
            'no-unused-vars': 'off', // More flexible for test files
        },
    },
    // Apply Prettier config to disable conflicting rules
    prettierConfig,
];
