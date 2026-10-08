# Browser review links

The assistant prepares the recipe offline. The contributor's normal browser calls the existing password-protected, add-only service. No workspace network access, MCP installation, network-setting change, or restart is required. The browser must still reach the website and the contributor must have the correct family password.

## Prepare the link

Review page: `https://www.daytongrowth.co/recipe-book/add.html`

Prepare the schema's JSON object with `owner`, `recipe`, and `image`. Include `owner.name` for every person, including original people. Optionally include `version: 1`. Choose a unique recipe slug. The link supports only `image: {"url":"https://..."}`. Without a supplied HTTPS dish photo, use `https://www.daytongrowth.co/recipe-book/all-recipes-family.jpg` and call it the family-book placeholder. The contributor can replace it with a JPG, PNG, or WebP on the review page; the browser resizes the photo automatically.

Encode the complete JSON as UTF-8, then URL-safe base64 without `=` padding. Append `#recipe=<encoded>` to the review page. Use a fragment, never query parameters. The fragment is read in the browser and is not included in the page request to the server. The page has no analytics or third-party scripts. Anyone with the link can read the prepared recipe: include only recipe content the contributor intends to share. Never include passwords or tokens.

Use an available runtime's standard library. Example, with a local recipe JSON prepared by the assistant:

```python
import base64, json
from pathlib import Path
payload = json.loads(Path("recipe-draft.json").read_text(encoding="utf-8"))
raw = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
if len(raw) > 24000:
    raise ValueError("Use the browser paste option for this recipe.")
encoded = base64.urlsafe_b64encode(raw).decode("ascii").rstrip("=")
assert json.loads(base64.urlsafe_b64decode(encoded + "=" * (-len(encoded) % 4))) == payload
print("https://www.daytongrowth.co/recipe-book/add.html#recipe=" + encoded)
```

The assistant writes and inspects this code itself; it is not a downloaded setup script. Do not send the local file to the contributor. Maximum unencoded payload: 24,000 UTF-8 bytes. Never silently remove quantities, steps, temperatures, or notes to shorten a recipe.

## If a link cannot be produced

Return the complete prepared JSON in a copyable code block and link to https://www.daytongrowth.co/recipe-book/add.html. Tell the contributor to expand **Have a prepared recipe instead of a link?**, paste it, and click **Review recipe**. Then they enter the password and click **Add this recipe**. This is copy-and-paste, never a download or command file.

## Publication

The browser validates the draft and renders the ingredients, steps, and notes as text. It makes no publishing request until the contributor clicks **Add this recipe** with a password. It sends the recipe to `/api/caruso-recipe-book` with the password in the authorization header. It never stores the password or includes it in the link. Wrong passwords can be corrected without publishing. Success shows the saved-addition link. The book reads additions directly, without a website rebuild. Uncertain outcomes and duplicate IDs block automatic retries.

Do not use the old direct-HTTP setup flow: it depends on sandbox network access, which this browser flow removes.
