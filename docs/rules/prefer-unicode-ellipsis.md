# prefer-unicode-ellipsis

Enforces unicode ellipsis in localized source string.

## Rule Details

```json
{    
    "rules": {
        "i18n-lingui/prefer-unicode-ellipsis": 2
    }
}
```

Examples of **incorrect** code for this rule:

```js
<Trans>LOADING...</Trans>;
```

```js
const hello = t`...Hello...`
```

Examples of **correct** code for this rule:

```js
<Trans>LOADING…</Trans>;
```

```js
const hello = t`…Hello…`
```
