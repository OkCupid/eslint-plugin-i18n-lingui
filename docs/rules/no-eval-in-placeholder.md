# no-eval-in-placeholder

Prohibits evaluation inside of placeholders of localized strings to ensure named placeholders in extracted source strings.

## Rule Details

```json
{    
    "rules": {
        "react-i18n/no-eval-in-placeholder": 2
    }
}
```

Examples of **incorrect** code for this rule:

```js
const Message = ({ numberOfLikes }) => 
    <Trans>{numberOfLikes - 1} other users also liked you!</Trans>;
```

Examples of **correct** code for this rule:

```js
const Message = ({ numberOfLikes }) => {
    const numberOfOtherLikes = numberOfLikes - 1;
    return <Trans>{numberOfOtherLikes} other users also liked you!</Trans>;
}
```
