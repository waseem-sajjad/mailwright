import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintConfigPrettier from 'eslint-config-prettier';
import unusedImport from 'eslint-plugin-unused-imports';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactHooks from 'eslint-plugin-react-hooks';
import eslintReactRules from 'eslint-react-rules';
import importPlugin from 'eslint-plugin-import';
import pluginReact from 'eslint-plugin-react';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import js from '@eslint/js';

export default tseslint.config(
    { ignores: ['dist', 'rules', 'vite.config.ts', 'eslint.config.js'] },
    {
        extends: [
            js.configs.recommended,
            ...tseslint.configs.recommended,
            pluginReact.configs.flat.recommended,
            importPlugin.flatConfigs.recommended,
            eslintReactRules.recommended,
            // Prettier last so it disables every conflicting stylistic rule.
            eslintConfigPrettier,
            eslintPluginPrettierRecommended,
        ],
        files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es5,
            },
            ecmaVersion: 'latest',
            sourceType: 'module',
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            'unused-imports': unusedImport,
            'jsx-a11y': jsxA11y,
        },
        settings: {
            react: {
                version: 'detect',
            },
            'import/resolver': {
                typescript: true,
                node: true,
            },
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'prettier/prettier': [
                'error',
                {
                    singleQuote: true,
                    endOfLine: 'auto',
                },
            ],
            'consistent-return': 'off',
            'class-methods-use-this': 'off',
            'sort-imports': [
                'error',
                {
                    ignoreCase: true,
                    allowSeparatedGroups: true,
                    ignoreDeclarationSort: true,
                    ignoreMemberSort: false,
                    memberSyntaxSortOrder: [
                        'none',
                        'all',
                        'multiple',
                        'single',
                    ],
                },
            ],
            'import/order': [
                1,
                {
                    groups: [
                        'builtin',
                        'external',
                        'internal',
                        'parent',
                        'sibling',
                        'index',
                    ],
                    'newlines-between': 'always-and-inside-groups',
                },
            ],
            'tailwindcss/no-custom-classname': 'off',
            'tailwindcss/classnames-order': 'off',
            'import/extensions': 'off',
            'react/function-component-definition': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unsafe-function-type': 'off',
            'react/destructuring-assignment': 'off',
            'react/require-default-props': 'off',
            'react/jsx-props-no-spreading': 'off',
            '@typescript-eslint/comma-dangle': 'off',
            'no-param-reassign': 'off',
            '@typescript-eslint/consistent-type-imports': 'error',
            'no-restricted-syntax': [
                'error',
                'ForInStatement',
                'LabeledStatement',
                'WithStatement',
            ],
            'import/prefer-default-export': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            'unused-imports/no-unused-imports': 'error',
            'no-unused-vars': 'off',
            'import/no-dynamic-require': 'warn',
            'import/no-nodejs-modules': 'warn',
            'operator-linebreak': 'off',
            'unused-imports/no-unused-vars': [
                'error',
                {
                    vars: 'all',
                    varsIgnorePattern: '^_',
                    args: 'after-used',
                    argsIgnorePattern: '^_',
                },
            ],
        },
    },
);
