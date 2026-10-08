---
name: caruso-recipe-book
description: Prepare one family recipe and a browser review link for the Caruso Recipe Book. Works in Local or Cloud without contacting the recipe service; the contributor enters the password and approves on the website.
---

# Caruso Recipe Book

Use the same flow in **Local and Cloud**: interview the contributor, prepare a recipe, and give them a browser review link. Their normal browser handles the password and publication. **Do not check access to the recipe service or ask for the password in chat.** A blocked cloud workspace does not prevent preparing a link. Never ask the contributor to run commands, download a ZIP or setup script, install a connector, change network settings, or restart their assistant.

Read [references/recipe-schema.md](references/recipe-schema.md) and [references/browser-review.md](references/browser-review.md), resolving them relative to this skill. Source: https://github.com/rscboy/caruso-recipe-book; installable folder: `skills/caruso-recipe-book/`. Reading the instructions is enough to begin in this conversation. If asked to install permanently, use a trusted installer or copy the inspected Markdown to the local assistant's skill folder, preserving unrelated skills. Never claim a temporary cloud folder installs on their computer or account. Installation is optional for this workflow.

## Ask one question at a time

Accept information already supplied and ask only for what is missing.

1. **“Whose collection is this for?”** Offer Sammy, Sam G, Autumn, Addison, or somebody else. These are the original collections, not a freshly fetched list. Use IDs `sammy`, `sam-g`, `autumn`, `addison` for those people; derive a lowercase hyphenated ID for a new person. Always include the person's display name in `owner.name`.
2. **“Share the recipe link or paste the recipe here.”** Read an accessible recipe URL. If it is blocked, ask for the text instead. The recipe website does not need to be reachable from this workspace.
3. **“Any special notes or changes?”** “No” is a complete answer.
4. **“Do you have a photo to use?”** Accept a public HTTPS image URL or “no.” For an attached photo, they can choose it on the review page. Never put binary image data in the link. Without an HTTPS image, use the family-book placeholder in the browser reference and identify it honestly.

Preserve ingredients, quantities, timing, temperatures, attribution, and notes. Do not invent missing safety-critical instructions. Use the payload schema and put source attribution and contributor notes in `recipe.note`.

## Give a review link, never a download

Show a short preview with the collection, title, notes, and photo choice. Generate the review link **offline**, exactly as described in the browser reference, using an available runtime's standard library. Verify it decodes to the exact recipe payload. Never include a password or access token in the link or recipe.

Return a clickable Markdown link labeled **“Review and add your recipe”**. Say: **“Open the link, enter the family password, and click Add this recipe.”** They can choose their own photo there. The browser shows the full recipe before anything is added. Do not demand an extra yes in chat before preparing a link: their explicit **Add this recipe** click is the publishing approval.

The assistant must not call the add API or click the publishing button. Report only “ready to review” until the contributor reports success; generating a link does not save or publish a recipe. If the link is too large or no encoder is available, use the browser reference's copy-and-paste option, never a downloaded JSON file or a nonexistent uploader.

## Add-only boundary

Prepare exactly one recipe per run. Never edit, replace, reorder, or delete existing recipes or people. Never request repository write access or deployment credentials, or use them as a fallback. If their normal browser cannot reach the review page, explain that exact limitation; do not promise a skill can overcome browser or account restrictions.
