# Browser review links

Review page: `https://recipes.daytongrowth.co/recipe-book/manage.html`.

Prepare one version-2 JSON change as documented in recipe-schema.md. Serialize UTF-8 JSON, encode URL-safe base64 without padding, and append `#change=<encoded>` to the review page. The fragment stays out of the initial server request. Anyone possessing the review link can read its prepared content, so include recipe content only. Never embed credentials or binary photos.

Generate and verify offline with an available standard library, for example:

```python
import base64, json
raw = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
if len(raw) > 24000:
    raise ValueError("Use the browser paste option without truncating the recipe")
encoded = base64.urlsafe_b64encode(raw).decode("ascii").rstrip("=")
assert json.loads(base64.urlsafe_b64decode(encoded + "=" * (-len(encoded) % 4))) == payload
print("https://recipes.daytongrowth.co/recipe-book/manage.html#change=" + encoded)
```

Maximum payload: 24,000 UTF-8 bytes. If too large or no encoder is available, return the full JSON in a copyable code block and link to the review page. The person expands **Have a prepared change from your assistant?**, pastes it, and chooses **Review prepared change**. Do not send downloads or ask them to run commands.

A person signs in on the website or accepts their private invitation. A name search displays matching recipes; they choose the exact one. Edit drafts merge only supplied fields with the saved recipe. The review shows full before/after recipes, destination collection, and whether the recipe will enter or leave Trash. Nothing changes until they click the approval button. If they change the proposal or a duplicate choice, the website prepares a fresh review. Stale approvals require another review. Repeating the same approval does not apply the change twice.

Old `add.html#recipe=...` links continue to work and use the same managed store. Use version-2 links for new work.
