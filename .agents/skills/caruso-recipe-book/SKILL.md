---
name: caruso-recipe-book
description: Add one new recipe to the private Caruso family recipe website and publish it through the add-only recipe service. Use when someone wants to contribute a recipe for Sammy, Autumn, Addison, Sam G, or a new family member. Never use this skill to edit, replace, or delete an existing recipe.
---

# Caruso Recipe Book

Collect one recipe through the interview below, normalize it into the website schema, show a concise preview, and publish it with the bundled add-only script.

## Start with the interview

Before the first prompt, run `node scripts/add-recipe.mjs --list-owners` when the connection settings are available; use its returned names so the choices stay current. If the connection is not configured yet, use Sammy, Autumn, Addison, and Sam G. The first user-visible action must still be the first question below.

Do not research or parse the submitted recipe, draft the payload, edit files, or publish until the first four intake prompts have been answered. Ask them one at a time and wait for each answer. After the fourth answer, prepare the preview and ask the fifth confirmation prompt.

1. Ask exactly: **“Whose recipes are you adding it to?”** Offer every returned person, followed by “Add somebody else.” If the owner lookup was unavailable, offer Sammy, Autumn, Addison, Sam G, or “Add somebody else.” If they choose somebody else, ask for that person’s display name. Derive a lowercase hyphenated ID and initials.
2. Ask: **“What is the link to the recipe, or would you rather copy and paste it here?”** Accept either a public URL or pasted recipe text. If they provide a URL, read that page and extract the recipe. If the page is inaccessible, ask them to paste the recipe instead.
3. Ask: **“Are there any special notes or instructions I should include?”** “No” is a complete answer.
4. Ask: **“Is there a specific image you want me to use for the dish?”** Accept an HTTPS image URL, a local attached JPG/PNG/WebP file, or “no.” When they say no, choose a relevant, reusable HTTPS image and tell them which one is in the preview.
5. Ask: **“Ready for me to add this recipe and publish it to the website?”** Show the owner, recipe title, source, image choice, and special note immediately before this question. Publishing is an external change and requires an explicit yes at this point.

If the user provided several answers in advance, do not repeat those questions; confirm only the missing items in the same order. Never treat invoking the skill alone as approval to publish.

## Prepare the addition

Read [references/recipe-schema.md](references/recipe-schema.md) before building the payload. Preserve meaningful quantities, temperatures, timings, attribution, and the user’s special notes. Do not silently invent missing safety-critical cooking temperatures. Choose a unique slug after checking the source recipe IDs when a project checkout is available; otherwise use a specific slug based on the dish and owner.

Write the final payload to a temporary JSON file outside the skill folder. Do not put credentials or user recipes inside the skill package. For a local image, encode it into the payload only at publish time as described in the schema reference.

## Publish through the add-only boundary

Run:

```sh
node scripts/add-recipe.mjs --payload /absolute/path/to/recipe.json
```

The script reads the connection from environment variables or the local credentials file created by `node scripts/configure.mjs`. If neither is configured, stop and explain that the contributor needs the owner-issued add-only access code and should rerun the installer setup. Never request, accept, store, or use a GitHub token, Vercel token, repository write credential, or general deployment credential.

The service only appends a new recipe (and, when requested, a new person) to the canonical source. It rejects duplicate IDs, unsupported fields, malformed data, source-format drift, and non-fast-forward updates. The resulting Git commit starts the normal production deployment.

After success, report the recipe link, commit link, and that deployment has started. Do not claim the live site is updated until the recipe URL responds with the new recipe. Check for a bounded period; if it is still deploying, say so and provide the link rather than retrying the addition.

## Hard boundary

- Add exactly one new recipe per confirmed run.
- Never edit, replace, reorder, or delete an existing recipe or person.
- Never use repository access as a fallback.
- Never expose either add-only token in output, files, logs, or URLs.
- If asked to modify or delete content, decline that part and explain that this skill is intentionally add-only.

## Owner-only setup

When the website owner is installing or sharing this skill, read [references/owner-setup.md](references/owner-setup.md). Contributors do not need this reference during ordinary recipe entry.
