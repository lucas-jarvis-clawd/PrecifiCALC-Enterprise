import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  {
    ignores: [
      'dist/**/*',
      'build/**/*',
      'node_modules/**/*'
    ]
  },
  
  {
    files: ['**/*.{js,jsx}'],
    
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021
      },
      
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: {
          jsx: true
        },
        sourceType: 'module'
      }
    },
    
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    
    rules: {
      // Base JavaScript
      ...js.configs.recommended.rules,
      
      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // Performance and quality
      'no-unused-vars': ['error', {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
        varsIgnorePattern: '^[A-Z_]|^React$'
      }],
      
      'no-console': ['warn'],
      'no-debugger': ['error'],
      'no-empty': ['error', { allowEmptyCatch: false }],
      'prefer-const': 'error',
      'no-var': 'error',
      
      // React specific
      'react-refresh/only-export-components': ['warn', { 
        allowConstantExport: true 
      }]
    }
  }
];