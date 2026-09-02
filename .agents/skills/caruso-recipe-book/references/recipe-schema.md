# Recipe payload schema

Send one JSON object with `owner`, `recipe`, and `image`.

```json
{
  "owner": { "id": "sammy" },
  "recipe": {
    "id": "crispy-lemon-potatoes",
    "title": "Crispy Lemon",
    "subtitle": "Potatoes",
    "description": "A one-sentence card description.",
    "prep": "15 min",
    "cook": "45 min",
    "total": "1 hour",
    "yield": "4 servings",
    "tags": ["Dinner", "Vegetarian", "Crispy"],
    "color": "gold",
    "ingredients": [{ "category": "Potatoes", "items": ["2 lb Yukon Gold potatoes"] }],
    "steps": [{ "title": "Roast", "text": "Roast at 425°F until deeply golden." }],
    "note": "Special note or source attribution."
  },
  "image": { "url": "https://example.com/dish.jpg" }
}
```

Existing owner IDs are `sammy`, `autumn`, `addison`, and `sam-g`. For a new person, include `name` and optionally `initials`:

```json
"owner": { "id": "jane-caruso", "name": "Jane Caruso", "initials": "JC" }
```

New people receive the family profile image by default. Adding a custom profile picture is outside this skill’s add-only recipe scope.

For an attached local dish image, use `image/jpeg`, `image/png`, or `image/webp`. Set `filename`, `mimeType`, and base64-encoded file bytes instead of `url`.

Allowed colors: `blue`, `coral`, `gold`, `green`, `lavender`, `lilac`, `mint`, `peach`, `pink`, `rust`, `tomato`.

Use one to six short tags. Ingredient groups need a category and one or more literal ingredient lines. Steps need a short action title and complete instruction text. Put the user’s special instructions and source attribution in `note`; the note may combine both.
