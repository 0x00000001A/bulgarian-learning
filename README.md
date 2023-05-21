# Bulgarian Learning

Tool for learning the Bulgarian language. You may use it for any other language, for learning words, letters, etc.
Just fill the `data.json` in the src directory of the project with your data, deploy, and chill.
It automatically saves your progress to the local storage.

# Stack
- TypeScript
- React
- Vite

## Run and Deploy
- Clone the repository
- Fill the "homepage" property (ex.: `https://GH_PROFILE_NAME.github.io/PROJECT_REPO_NAME`)
- Update the `base` property in the `vite.config.ts` in the root of the project
- `npm run deploy`
- Open the link from the "homepage" property in your browser

## Data format

```
{
  "name": "LANG_NAME",
  "groups": [
    {
      "description": "GROUP_DESCRIPTION",
      "letters": [
        {"letter": "LANG_NAME_LETTER_OR_WORD", "description": ["TRANSLATION"]},
        ...
      ]
    },
    ...
  ]
}
```

Examples:

```
{
  "name": "JAPAN",
  "groups": [
    {
      "description": "Alphabet",
      "letters": [
        {"letter": "あ", "description": ["a"]},
        {"letter": "い", "description": ["i"]},
        ...
      ]
    },
    ...
  ]
}
```


```
{
  "name": "JAPAN",
  "groups": [
    {
      "description": "Words",
      "letters": [
        {"letter": "きんぎょ", "description": ["Goldfish", "Something"]},
        {"letter": "たばこ", "description": ["Tobacco"]},
        ...
      ]
    },
    ...
  ]
}
```

Cheers
