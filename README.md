# eslint-plugin-i18n-lingui

ESLint Plugin to enforce i18n best practices.

You should use this plugin if:

1. You use [lingui](https://github.com/lingui/js-lingui) to localize your application.
2. You want to avoid common pitfalls in wrapping source strings that could result poor quality translations.

## Installation

```
npm install eslint-plugin-i18n-lingui --save-dev
```

```
yarn add eslint-plugin-i18n-lingui --dev
```

## Usage

Add `i18n-lingui` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix.

```js
plugins: [
    "i18n-lingui"
]
```

Then configure the rules you want to use under the `rules` section.

```js
rules: {
    "i18n-lingui/no-eval-in-placeholder": 1, // warning
    "i18n-lingui/prefer-unicode-ellipsis": 2, // error
}
```

## List of supported rules

| Has Fixer | Rule                               | Description                                             |
|-----------|------------------------------------|---------------------------------------------------------|
|           | [no-eval-in-placeholder](https://github.com/OkCupid/eslint-plugin-i18n-lingui/blob/main/docs/rules/no-eval-in-placeholder.md)             | No evaluation of placeholder values in wrapped strings  |
|    ✔️      | [i18n-lingui/prefer-unicode-ellipsis](https://github.com/OkCupid/eslint-plugin-i18n-lingui/blob/main/docs/rules/prefer-unicode-ellipsis.md) | Detects three periods in Trans or t tag wrapped strings |
