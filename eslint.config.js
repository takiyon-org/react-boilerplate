import babelParser from '@babel/eslint-parser';
import { FlatCompat } from '@eslint/eslintrc';
import globals from 'globals';

import webpackConfig from './webpack.config.js';

const compat = new FlatCompat();

export default [
    ...compat.extends('eslint-config-takiyon-react'),
    {
        files: [
            'src/js/**/*.{js,jsx}',
            'test/**/*.{js,jsx}',
            '*.{js,jsx}',
        ],
        languageOptions: {
            parser: babelParser,

            // https://github.com/import-js/eslint-plugin-import/issues/2556
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
        },
        ignores: ['./node_modules/**/*'],
        rules: {
            'import/extensions': ['error', 'ignorePackages', {
                js: 'always',
                jsx: 'always',
                mjs: 'always',
                cjs: 'never',
            }],
            'import/no-extraneous-dependencies': ['error', {
                devDependencies: [
                    'test/**',
                    '*.{js,cjs,mjs}',
                ],
                optionalDependencies: false,
            }],
        },
        settings: {
            // Account for webpack.resolve.module imports
            'import/resolver': {
                webpack: {
                    config: webpackConfig,
                },
            },

            // https://github.com/import-js/eslint-plugin-import/issues/2556
            'import/parsers': {
                espree: ['.js', '.cjs', '.mjs', '.jsx'],
            },
        },
    },
    {
        // Front-end files
        files: ['src/js/**/*.{js,jsx}'],
        languageOptions: {
            globals: {
                APP_NAME: 'readonly',
                ...globals.browser,
            },
        },
    },
    {
        // Test files
        files: ['test/**/*.{js,jsx}'],
        languageOptions: {
            globals: {
                APP_NAME: 'readonly',
                ...globals.mocha,
            },
        },
    },
    {
        // Build files
        files: ['*.{js,jsx}'],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
    },
];
