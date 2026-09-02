# Deployment fail-safe

After the add-only service accepts a recipe, `scripts/add-recipe.mjs` polls the returned recipe URL for up to about one minute. It looks for the accepted recipe ID or title in the live page.

If the recipe is still absent, the script can run one fallback only when it is invoked from a local Git checkout that already has `.vercel/project.json`. It verifies that the accepted commit changed the recipe source and contains the new recipe ID, then creates a detached temporary checkout at that exact commit. It copies only the existing project linkage into that disposable checkout and runs a forced production Vercel deployment there.

The fallback never deploys the current working tree, never changes a recipe or owner, and never reads or prints Vercel, GitHub, or recipe access credentials. If a linked local checkout or Vercel CLI session is unavailable, it reports `fallback_could_not_run` with a non-sensitive reason. If the fallback deploys but the public page is not ready during its second bounded check, it reports `deployment_still_pending`.
