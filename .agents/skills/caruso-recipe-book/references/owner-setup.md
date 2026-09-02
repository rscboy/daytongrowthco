# Owner setup and sharing

This is the one-time setup for the website owner. Contributors do not need GitHub or Vercel access.

Share the public GitHub repository as the primary source. A contributor can ask Codex or Claude Code to install the attached downloaded ZIP after reviewing it, which avoids depending on an AI sandbox being allowed to contact the recipe website. Keep the folder name `caruso-recipe-book`; Codex normally uses `$CODEX_HOME/skills` or `~/.codex/skills`, and Claude Code normally uses `~/.claude/skills`.

Configure these server-side environment variables in the production Vercel project:

- `CARUSO_RECIPE_ADD_TOKEN`: the private service token; do not distribute it to contributors.
- `CARUSO_RECIPE_INVITE_SECRET`: a random value of at least 32 characters used to generate 30-day guest codes.
- `CARUSO_RECIPE_GITHUB_TOKEN`: a fine-grained GitHub token or GitHub App token with Contents write access only to `rscboy/daytongrowthco`.
- `CARUSO_RECIPE_GITHUB_REPOSITORY`: optional; defaults to `rscboy/daytongrowthco`.
- `CARUSO_RECIPE_GITHUB_BRANCH`: optional; defaults to `main`.
- `CARUSO_RECIPE_SITE_URL`: optional; defaults to the production recipe-book URL.

Open the Recipe Book website's **Add** panel and use **Generate guest code** for each contributor. Guest codes expire after 30 days and can add recipes only. Give each contributor the skill ZIP or public repository link and their guest code through a separate private channel. The bundled `scripts/configure.mjs` saves both production service addresses and tries them in order.

- `CARUSO_RECIPE_API_URL=https://www.daytongrowth.co/api/caruso-recipe-book`
- `CARUSO_RECIPE_ADD_TOKEN=<the guest code>`

Environment variables remain supported for managed installations. For noninteractive agents, put the code in a temporary local file and run `node scripts/configure.mjs --code-file /absolute/path/to/code.txt`; delete that temporary file afterward. The setup stores equivalent values at `~/.config/caruso-recipe-book/credentials.json` with user-only file permissions.

Some hosted AI environments block every non-allowlisted service, including the publish API. This cannot be bypassed inside a skill. In that case the script returns `browser_handoff_required` with the prepared JSON path. The contributor downloads that JSON, opens the website's **Add** panel in a normal browser, and uses **Publish a prepared recipe** with the guest code. The same add-only server validation applies.

The deployment fail-safe runs automatically after an accepted recipe. It can redeploy only from a disposable exact-commit checkout when the machine running the skill is already inside a locally linked Vercel checkout of this website. Otherwise it reports a non-sensitive pending reason and never deploys from the contributor's current files.

Do not place any guest code or token in the skill files or a Git repository. Rotate `CARUSO_RECIPE_INVITE_SECRET` to invalidate every existing guest code immediately.

The server-side GitHub credential is intentionally never distributed. The public token can call only this route; the route constructs an append-only commit to the recipe source and optional dish-image path.
