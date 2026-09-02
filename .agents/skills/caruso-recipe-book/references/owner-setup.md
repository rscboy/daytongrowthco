# Owner setup and sharing

This is the one-time setup for the website owner. Contributors do not need GitHub or Vercel access.

Install the shared `caruso-recipe-book` folder under the contributor’s Codex skills directory (normally `$CODEX_HOME/skills`, or `~/.codex/skills` when `CODEX_HOME` is unset). Keep the folder name unchanged so `$caruso-recipe-book` invokes it.

Configure these server-side environment variables in the production Vercel project:

- `CARUSO_RECIPE_ADD_TOKEN`: a long random token shared only with invited contributors.
- `CARUSO_RECIPE_GITHUB_TOKEN`: a fine-grained GitHub token or GitHub App token with Contents write access only to `rscboy/daytongrowthco`.
- `CARUSO_RECIPE_GITHUB_REPOSITORY`: optional; defaults to `rscboy/daytongrowthco`.
- `CARUSO_RECIPE_GITHUB_BRANCH`: optional; defaults to `main`.
- `CARUSO_RECIPE_SITE_URL`: optional; defaults to the production recipe-book URL.

Give each invited contributor the skill ZIP and the add-only access code through a separate private channel. The bundled `scripts/configure.mjs` saves this local connection:

- `CARUSO_RECIPE_API_URL=https://www.daytongrowth.co/api/caruso-recipe-book`
- `CARUSO_RECIPE_ADD_TOKEN=<the invited-contributor token>`

Environment variables remain supported for managed installations. The interactive setup stores equivalent values at `~/.config/caruso-recipe-book/credentials.json` with user-only file permissions.

Do not place the token in the skill files or a Git repository. Rotate `CARUSO_RECIPE_ADD_TOKEN` to revoke previously shared access. Because one shared token cannot identify or revoke a single person, use a separate gateway or per-user token table if individual revocation or auditing is required later.

The server-side GitHub credential is intentionally never distributed. The public token can call only this route; the route constructs an append-only commit to the recipe source and optional dish-image path.
