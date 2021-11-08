# no-useless-string-wrapping

Warns about unnecessarily wrapping a string that only contains an expression.

## Rule Details

```json
{    
    "rules": {
        "i18n-lingui/no-useless-string-wrapping": 1
    }
}
```

Examples of **incorrect** code for this rule:

```js
<Trans>{name}</Trans>;
```

```js
t`${name}`;
```

Examples of **correct** code for this rule:

```js
<Trans>Hello {name}</Trans>;
```

```js
t`hello ${name}`;
```
