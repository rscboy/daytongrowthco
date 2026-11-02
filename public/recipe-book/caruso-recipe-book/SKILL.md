---
name: caruso-recipe-book
description: Help anyone with a Caruso Recipe Book invitation add, find, edit, move, trash, restore, undo, or make a variation of family recipes through browser review links.
---

# Caruso Recipe Book

Help the contributor manage the family book using their own AI assistant. Prepare changes in chat; the contributor signs in and approves them in their normal browser. The same flow works in Local and Cloud without connectors, repository access, deployment credentials, or workspace access to the recipe service.

Source and installable folder: https://github.com/rscboy/caruso-recipe-book/tree/main/skills/caruso-recipe-book. The website also publishes this folder at https://recipes.daytongrowth.co/recipe-book/caruso-recipe-book/SKILL.md. Read these instructions directly when installation is unavailable. Do not claim this installs a skill on someone else's computer.

## Choose the action

Support add, edit (including rename and photo changes), move, delete, restore, revert an earlier version, undo the contributor's last change, and make a variation. Read [references/browser-review.md](references/browser-review.md) for link generation and [references/recipe-schema.md](references/recipe-schema.md) for payloads.

Use information already provided. Ask one missing question at a time. For additions, establish whose collection, the recipe link or pasted text, any changes or notes, and photo choice. Accept screenshots, handwritten recipes, and voice transcripts when available; flag unreadable amounts and missing temperatures instead of inventing them. Read accessible recipe URLs, or ask for text when blocked. Preserve quantities, instructions, attribution, and notes.

For edits, include only requested changes. A rename must not replace ingredients or cooking instructions. Do not require the existing full recipe from chat: the website loads it and merges the patch. For vague names, send a search intent using `query`; the contributor selects the exact recipe on the website. Never fabricate an existing recipe ID, assume the first match, or ask the assistant to fetch authenticated recipes.

For a new recipe or variation, use a unique slug. A variation preserves its original recipe and source attribution; the website can copy the original before applying supplied changes. Without a photo, use the family-book placeholder and identify it honestly. The contributor can choose their photo on the review page.

## One review link per change

Generate a verified browser review link offline. Return a clickable link labeled **Review your recipe change**, plus one sentence describing the requested action. Say: **Open the link, sign in or accept your invitation, check the exact change, and approve it.** When a name is vague, mention that they will select the recipe first.

Do not ask for a password, invitation token, session cookie, or private key in chat. Never include credentials in a review payload or link. Invitation links go directly to the person's browser; they do not belong in the AI conversation. A person without an invitation can ask a family editor to open **Manage recipes → Invite someone**. The skill itself grants no access. After accepting an invitation, the website offers personal password setup immediately. They can later sign in using email and password, or reopen the private invitation before it expires. Remind them to bookmark https://recipes.daytongrowth.co. Accounts retain only their assigned access until a family editor revokes it.

Contributors manage their assigned collection; family editors manage all recipes and invitations. The website enforces access, identifies duplicates, previews before/after, and checks for intervening edits. Deleted recipes go to Trash and remain restorable. Earlier versions remain in History. A duplicate warning requires an explicit choice to update the existing recipe or save a separate version.

The assistant prepares changes; it must not submit approval or publishing requests. Report **ready to review**, never saved, until the contributor reports success. If a connection fails after approval, the contributor can retry the same approval safely; do not create a fresh recipe ID to bypass an uncertain result. If the browser cannot reach the website, state that limitation without proposing network, deployment, or repository workarounds.
