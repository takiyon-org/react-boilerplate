import tsParser from '@typescript-eslint/parser';
import takiyonConfig from 'eslint-config-takiyon-react';
import globals from 'globals';

import webpackConfig from './webpack.config.js';

export default [
    ...takiyonConfig,
    {
        files: [
            '**/*.{js,ts,tsx}',
        ],
        ignores: ['./node_modules/**/*'],
        settings: {
            // Account for webpack.resolve.module imports
            'import/resolver': {
                webpack: {
                    config: webpackConfig,
                },
            },
        },
        rules: {
            'react/jsx-filename-extension': ['error', {
                extensions: ['.tsx'],
            }],
            'import/extensions': ['error', 'ignorePackages', {
                ts: 'never',
                tsx: 'never',
            }],
        },
    },
    {
        // Front-end files
        files: ['src/js/**/*.{js,ts,tsx}'],
        languageOptions: {
            globals: {
                APP_NAME: 'readonly',
                ...globals.browser,
            },
        },
    },
    {
        // Test files
        files: ['test/**/*.{js,ts,tsx}'],
        languageOptions: {
            globals: {
                APP_NAME: 'readonly',
                ...globals.mocha,
            },
        },
    },
    {
        // Build files
        files: ['*.{js,ts,tsx}'],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
    },
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parser: tsParser,
        },
    },
    {
        files: ['**/*.d.ts'],
        rules: {
            'no-unused-vars': 'off',
        },
    },
];
