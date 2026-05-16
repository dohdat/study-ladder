module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true
  },

  parser: "@typescript-eslint/parser",

  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },

  globals: {
    chrome: "readonly",
    indexedDB: "readonly",
    IDBDatabase: "readonly",
    IDBObjectStore: "readonly",
    IDBRequest: "readonly",
    IDBTransactionMode: "readonly",
    IDBValidKey: "readonly"
  },

  plugins: ["@typescript-eslint", "react-hooks"],

  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],

  rules: {
    "max-lines": ["error", { max: 600, skipBlankLines: true, skipComments: true }],
    "max-lines-per-function": [
      "error",
      { max: 80, skipBlankLines: true, skipComments: true }
    ],
    "max-depth": ["error", 4],
    "complexity": ["error", 10],
    "no-nested-ternary": "error",
    "eqeqeq": ["error", "always"],
    "curly": ["error", "all"],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "consistent-return": "error",
    "no-else-return": "error",
    "no-implicit-globals": "error",
    "no-global-assign": "error",
    "no-loop-func": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "error",
    "no-restricted-syntax": [
      "error",
      {
        "selector": "CallExpression[callee.property.name='addEventListener'] > :nth-child(2):not(Identifier)",
        "message": "addEventListener must use a named function so it can be removed"
      },
      {
        "selector": "CallExpression[callee.property.name='removeEventListener'] > :nth-child(2):not(Identifier)",
        "message": "removeEventListener must use the same named function reference"
      },
      {
        "selector": "NewExpression[callee.name='MutationObserver']",
        "message": "Ensure MutationObserver.disconnect() is called"
      },
      {
        "selector": "NewExpression[callee.name='PerformanceObserver']",
        "message": "Ensure PerformanceObserver.disconnect() is called"
      }
    ],
    "no-restricted-globals": [
      "error",
      {
        "name": "setInterval",
        "message": "Ensure intervals are cleared with clearInterval"
      }
    ],
    "no-magic-numbers": [
      "error",
      {
        "ignore": [0, 1],
        "ignoreArrayIndexes": true,
        "enforceConst": true,
        "detectObjects": false
      }
    ]
  },

  overrides: [
    {
      files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"],
      rules: {
        "max-lines": "off",
        "max-lines-per-function": "off",
        "max-depth": "off",
        "complexity": "off",
        "consistent-return": "off",
        "no-else-return": "off",
        "no-magic-numbers": "off"
      }
    },
    {
      files: ["data/**/*.ts", "types/**/*.ts", "*.config.ts", "*.config.mjs", "next-env.d.ts"],
      rules: {
        "@typescript-eslint/triple-slash-reference": "off",
        "no-magic-numbers": "off"
      }
    }
  ]
};
