import { completeConfigBase } from 'eslint-config-complete';
import { defineConfig } from 'eslint/config';

export default defineConfig(
    ...completeConfigBase,

    {
        ignores: ['public/theme-init.js'],
    },

    {
        files: ['vite.config.ts'],
        languageOptions: {
            parserOptions: {
                projectService: true,
                allowDefaultProject: [],
            },
        },
    },

    {
        files: ['**/*.d.ts'],
        rules: {
            'import-x/no-default-export': 'off',
        },
    },

    {
        rules: {
            '@stylistic/quotes': 'off',
            '@typescript-eslint/consistent-type-definitions': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/strict-boolean-expressions': 'off',
            'n/file-extension-in-import': 'off',
            '@typescript-eslint/restrict-plus-operands': 'off',
            'import-x/no-unassigned-import': [
                'error',
                {
                    allow: ['**/*.css'],
                },
            ],
        },
    }
);
