# Recipe change schema

Every draft has `version: 2` and `action`. Existing recipes are identified by `recipeId` only when known, otherwise by a human-readable `query` for selection in the browser. Include exactly the requested action. Do not include authentication information.

## Add

```json
{
  "version": 2,
  "action": "add",
  "owner": {"id":"sammy","name":"Sammy","initials":"S"},
  "recipe": {
    "id":"crispy-lemon-potatoes-unique-slug",
    "title":"Crispy Lemon", "subtitle":"Potatoes",
    "description":"Golden potatoes with lemon and herbs.",
    "prep":"15 min", "cook":"45 min", "total":"1 hour", "yield":"4 servings",
    "tags":["Dinner","Vegetarian"], "color":"gold",
    "ingredients":[{"category":"Potatoes","items":["2 lb Yukon Gold potatoes"]}],
    "steps":[{"title":"Roast","text":"Roast at 425°F until deeply golden."}],
    "note":"Preserve the supplied source attribution and contributor notes here."
  },
  "image":{"url":"https://recipes.daytongrowth.co/recipe-book/all-recipes-family.jpg"}
}
```

The recipe example illustrates structure; preserve the user's actual complete recipe. Never invent missing cooking instructions. Required text fields must be nonempty and at most 1,500 characters. Use one to six tags of at most 40 characters; one to twelve ingredient groups with one to sixty items each; one to thirty steps. Colors: blue, coral, gold, green, lavender, lilac, mint, peach, pink, rust, tomato. `image.url` must be HTTPS; the contributor may replace it by uploading a photo on the website.

Owner IDs for original collections: sammy, sam-g, autumn, addison. Do not treat these as a current owner directory. Invited contributors use their assigned collection; omit `owner` when unknown and let the website select their collection. New people use lowercase hyphenated IDs with `name` and `initials`.

## Edit, rename, photo, move, trash, restore

```json
{"version":2,"action":"edit","query":"Gigi pasta","changes":{"title":"Autumn's Vodka","subtitle":"Pasta"}}
```

Allowed `changes`: title, subtitle, description, prep, cook, total, yield, tags, color, ingredients, steps, note, image. Patches include only requested fields. Ingredient and step arrays replace the whole corresponding array, so never prepare a partial replacement when the full saved list is unknown; open an edit intent with `query` and let the contributor edit it on the website instead. Photo-only edits may use `image: {"url":"https://..."}` at the top level or `changes.image`.

```json
{"version":2,"action":"move","query":"chili","owner":{"id":"benny","name":"Benny","initials":"B"}}
```

```json
{"version":2,"action":"delete","query":"Gigi pasta"}
```

```json
{"version":2,"action":"restore","query":"Gigi pasta"}
```

```json
{"version":2,"action":"undo"}
```

Deletion is recoverable Trash. Restore searches Trash. Undo reviews the contributor's most recent change; it does not overwrite a later edit by someone else. To recover an older version, link to the management page and tell the contributor to open **History → Review version before this change**. Use `action: "revert"` with `recipeId` and `historyId` only when those exact values are known.

## Make my version

```json
{"version":2,"action":"variation","query":"chili","recipe":{"id":"bennys-chili-unique-slug","title":"Benny's Chili"}}
```

The website copies the chosen original, preserves its attribution and instructions, applies supplied recipe fields, and defaults to the contributor's collection. New variants need a new unique ID. Do not set `allowDuplicate` in AI drafts: the person should make that choice after seeing the matching recipes in the browser.
