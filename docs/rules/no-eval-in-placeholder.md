# no-eval-in-placeholder

Prohibits evaluation inside of placeholders of localized strings to ensure named placeholders in extracted source strings.

## Rule Details

```json
{    
    "rules": {
        "i18n-lingui/no-eval-in-placeholder": 2
    }
}
```

Examples of **incorrect** code for this rule:

```js
const Message = ({ numberOfLikes }) => 
    <Trans>{numberOfLikes - 1} other users also liked you!</Trans>;
```

Examples of **correct** code for this rule:

Identifiers are OK.

```js
const Message = ({ numberOfLikes }) => {
    const numberOfOtherLikes = numberOfLikes - 1;
    return <Trans>{numberOfOtherLikes} other users also liked you!</Trans>;
}
```

Literals are OK.

```js
const Message = ({ numberOfLikes }) => {
    const numberOfOtherLikes = numberOfLikes - 1;
    return (
        <Trans>
            Check{" "}
            <a href="https://www.okcupid.com/careers">
                this
            </a>{" "}
            out.
        </Trans>
    );
}
```
