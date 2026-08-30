# Production deployment

Publish DaytonGrowthCo with this command only:

```sh
npm run deploy:production
```

The command refuses to publish when:

- the current source contains the retired homepage or recipe-book release;
- the Secret Projects manager is missing its required controls;
- any production website file is modified or untracked instead of saved in Git.

The normal Vercel build runs the release check again. Do not deploy a locally cached
`.vercel/output` bundle or use `vercel deploy --prebuilt`; that can bypass the source
version being reviewed.

If a release ever needs to be undone, first identify and verify the exact known-good
deployment. Roll production back to that deployment rather than rebuilding an older
Git checkout.
