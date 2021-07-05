# prefer-unicode-ellipsis

Enforces unicode ellipsis in localized source string.

## Rule Details

```json
{    
    "rules": {
        "react-i18n/prefer-unicode-ellipsis": 2
    }
}
```

Examples of **incorrect** code for this rule:

```js
const Message = ({ numberOfLikes }) => 
    <Trans>LOADING...</Trans>;
```

Examples of **correct** code for this rule:

```js
const Message = ({ numberOfLikes }) => 
    <Trans>LOADING…</Trans>;
```
