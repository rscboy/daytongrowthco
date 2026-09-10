# Five-Star Freeway

A complete 150-second arcade driving mode for the private DaytonGrowthCo studio.

## Run locally

Use Node 22–24, run `npm install`, then `npm run dev`. Sign in to `/projects/secret-projects` with the existing owner credentials and open Five-Star Freeway. The route is `/projects/secret/five-star-freeway`. Never bypass its server access guard for a preview.

## Privacy and sharing

The project starts with sharing off and no visitor password. Existing studio controls manage sharing and passwords. Business details stay in React memory and are cleared on refresh. Only vehicle, camera, audio, graphics, difficulty, high score, and last goal are saved locally. Clear My Data resets these preferences. The post-game form is explicitly a local demonstration and sends nothing. Existing site analytics are inherited; the game container is masked for Clarity and no game form values are sent by game code.

## Play

W/Up accelerates, S/Down brakes, A/D or Left/Right steers. Q/E hold turn signals, L toggles headlights, B toggles high beams, H sounds the horn, R looks behind, C changes camera, P/Escape pauses, and M opens the map. Gamepads support steering and throttle/brake triggers. Touch controls appear on small screens and coarse pointers.

Right-lane decisions connect I-75 north to US 35 east, followed by I-675 north; remaining on I-75 leads to the I-70 east option. The fictional reputation crossroads contrasts manual requests with a consistent process. Real network connections are used with compressed distances and simplified geometry; this is not a navigation aid and no real exit numbers are claimed.

Route references:
- https://www.mvrpc.org/transportation/long-range-planning-lrtp/congestion-management-process
- https://www.transportation.gov/Freight/MFNTables/Ohio
- https://brphotos.dot.state.oh.us/Bridges.aspx?county=GRE&route=US-35

## Systems

- `game-model.ts`: profile validation, six vehicle definitions, six customer decisions, reputation and scoring.
- `vehicles.ts`: original badge-free procedural geometry, wheels, glazing, plates, decals and lamps. No third-party model assets.
- `road-scene.tsx`: Three.js renderer, road, traffic, eight hazards, convoy, weather, controls and continuous run.
- `audio.ts`: user-initiated synthesized engine, ambience, horn and interface audio.
- `freeway.tsx`: landing, setup, garage, HUD, accessible dialogs, results, local demo form and PNG export.

This release uses simplified original vehicle interpretations and arcade physics. Cockpit mode uses a lightweight dashboard overlay rather than six fully modeled interiors. Route ramps and road scenery are compressed interpretations, and audio is synthesized rather than recordings. Additional modes and instant replay are intentionally omitted.

## Verification

`npm run typecheck`

`npx eslint app/projects/secret/five-star-freeway`

`node scripts/verify-five-star-freeway.mjs`

`npm run build`

Browser verification covers the owner studio iframe, public/private/password access transitions in an isolated settings store, all six vehicles, profile validation, safe name rendering, the complete run, result download, refresh, and mobile controls.

## Deployment preservation

The starting workspace differed from the deployed site on September 10, 2026. The release is assembled in `/tmp/dgc-five-star-freeway-release` on `codex/five-star-freeway` from the source files of production deployment `dpl_CrR6qYhLsAvJz5U5YHfHHUdg2m69`, verified by SHA-1 against Vercel's deployment manifest. The existing live storage integration and sharing controls are preserved. Do not redeploy the older starting checkout as a replacement for this release.
