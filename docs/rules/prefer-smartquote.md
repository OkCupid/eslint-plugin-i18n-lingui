# prefer-unicode-ellipsis

Enforces the use of smartquotes `’`, `“`, and `”` in localized strings.

## Rule Details

```json
{    
    "rules": {
        "i18n-lingui/prefer-smartquotes": 2
    }
}
```

Examples of **incorrect** code for this rule:

```js
<Trans>I'm "Bad"</Trans>
```

```js
t`Here's "this"`
```

Examples of **correct** code for this rule:

```js
<Trans>I’m “Bad”</Trans>
```

```js
t`Here’s “this”`
```
