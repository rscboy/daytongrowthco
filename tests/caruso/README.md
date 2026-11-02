# Recipe workflow tests

Run the deterministic behavior and storage tests with Node 22.7 or newer:

```sh
node --test tests/caruso/management.test.mjs tests/caruso/storage.test.mjs tests/caruso/browser-drafts.test.mjs tests/caruso/reader.test.mjs
```

For the real Next.js route and browser workflow, start a fresh isolated test server:

```sh
node tests/caruso/start-test-site.mjs
```

Then, in another terminal:

```sh
node --test --test-concurrency=1 tests/caruso/accounts-http.test.mjs tests/caruso/email-http.test.mjs tests/caruso/http.test.mjs
```

The test server uses fake credentials and an explicitly preloaded storage simulator.
It makes no production recipe or invitation writes. Restart it before repeating the
HTTP suite, because that suite intentionally exercises persistent changes during its run.
The application contains no test endpoint or storage bypass. The fixture contains
the five existing live additions used to verify preservation of the 30 original recipes.

For a browser check, open `http://127.0.0.1:3099/recipe-book/manage.html`.
The test-only editor password is `local-editor-test`. Create a contributor invitation,
open it, and test an AI-prepared draft, edit, trash, restore, and duplicate review.

Production verification additionally requires a successful build, release guards,
the protected CRM route, and an uploaded-source comparison against the production
baseline. Never load the full production environment into this test server.

The account suite verifies invitation-bound setup, sign-out, email sign-in, password rotation, session invalidation and revoked access. The CRM repository tests real salted password hashing, concurrent registration and durable rate limits separately.
