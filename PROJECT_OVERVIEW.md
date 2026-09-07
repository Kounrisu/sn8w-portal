# sn8w Portal
> Generated: 2026-09-07 | Path: `C:\dev\angular\08_sn8w-portal`

## Purpose
This is the public site and private toolkit for `www.sn8w.com`. It includes a public landing page plus private admin, todo, and diary tools.

## Why This Exists
The project consolidates a personal/public web presence with small operational tools behind authentication. It is designed for OVH shared hosting with an Angular frontend and PHP/MySQL API.

## What Has Been Done
- Built a public landing page with product/lab sections.
- Added multilingual support for English, French, German, Korean, Japanese, and Spanish.
- Added switchable visual themes.
- Added login-protected admin area.
- Added todo board and diary workflows.
- Added version badge metadata in the header.
- Added `SPEC.md` and a README that documents the shipped state.
- Git history shows todo/diary integration, Jira-style todo redesign, database cleanup notes, and footer contact email fixes.

## When
- Two active bursts: the initial build 2026-08-16 → 2026-08-17, then a second round 2026-09-07 adding project-availability/repo-link/admin features.

## Timeline

| When (local) | Commit | What |
|---|---|---|
| 08-16 07:43 | `bf45bc9` | First commit |
| 08-16 10:51 | `ce775ec` | PHP+MySQL backend, admin/todo/diary tools, 6-language i18n |
| 08-16 18:28–19:06 | `5489330`…`cfdbc91` | Deploy-pipeline gotchas fixed one by one: SFTP action pin, missing animations dep, PHP stack-trace leak, Apache SPA fallback, dotfile upload |
| 08-16 19:28–20:41 | `699b314`…`6d0853d` | "Lucky Squirrel" theme explored and simplified down to a sakura-branch hero photo |
| 08-17 09:20–16:36 | `0143d0b`…`0e1170b` | README rewrite, Jira-style todo board redesign, todo/diary sharing a list, footer contact-email fix |
| 09-07 14:19–16:53 | `f5c45ee`…`e520c45` | Project cards get real URLs/repo links/screenshots/activation requests; Online/Offline status with live-URL display; build number + commit message in nav; sortable admin panel |
| 09-08 00:25 | `706446f` | Added `PROJECT_OVERVIEW.md` |

## Token Consumption & Efficiency

No historical per-session token metrics are retained anywhere this file can read — check the Claude Code usage view for real numbers. Two observations from the git log itself:

- The 2026-08-16 18:28–19:06 window is five commits, each fixing one deploy-pipeline failure discovered by actually deploying (SFTP action version, a missing dependency, leaked PHP errors, missing SPA fallback, missing dotfiles). That's the expected cost of a first deploy to unfamiliar shared hosting — but `README.md`'s existing "Gotchas hit while building this deploy pipeline (don't repeat them)" section is exactly the right fix already in place. Keep adding to it the moment a new one is found, rather than letting a future session rediscover the same failure.
- The 08-16 19:28–20:41 "Lucky Squirrel" theme (illustration → squirrel added → squirrel dropped → replaced with a real photo) is three iterations converging on a simpler result. Nothing wrong with exploring, but front-loading "what should the hero visual actually be" as a one-line decision before generating variants would have saved two of those three passes.

## Improvement Roadmap

### 1. Features & functionality
1. **Update the project cards now that they're stale** — `api/schema.sql`'s seed data still lists "Lottery Verifier" as `concept` with no URL and "Lenormand" as `prototype` with no URL; both are now live (`lotokarma.sn8w.com`, `lenormand.sn8w.com`). This is the single most concrete, ready-to-do item here — the admin panel built in the 09-07 batch (real URLs, Online/Offline status) is exactly the tool to do it with.
2. **Automated health-check for Online/Offline** — the status is currently admin-set; a scheduled ping (the admin page already has a "trigger" pattern, per lotokarma's nightly-update precedent) would keep it accurate without a manual step.
3. Diary/todo tools are private and already share a list; as they accumulate entries, basic search or tagging would keep them usable.

### 2. UX / UI improvements
1. **Translation-completeness audit** — the 09-07 batch (repo links, activation requests, Online/Offline labels, build-number nav) shipped fast in one day; worth confirming all six languages (`EN/FR/DE/KO/JA/ES`) actually cover the new strings, since it's easy for new UI to launch English-only and get missed.
2. **Visually distinguish public vs. private areas** — the site deliberately mixes a public landing page with authenticated admin/todo/diary tools; a persistent visual cue (a colored bar, a lock icon in the nav) when inside the authenticated area would reduce the chance of confusing screenshots or a wrong-context mistake.

### 3. Technical / efficiency improvements
1. Keep the README "Gotchas" section as the living record of every deploy-pipeline failure — it's already well-used; the value is entirely in not letting it go stale.
2. No automated tests are mentioned running in CI for the PHP API side (`api/*.php`) — the Angular side has Vitest; consider at least a smoke test hitting each PHP endpoint after deploy, given shared hosting has already produced multiple deploy-only failures that unit tests wouldn't catch anyway (SFTP/dotfiles/Apache config), but would still catch a broken `projects.php` before a user sees it.

## Technical Stack
- Frontend: Angular, Angular Material, Angular CDK, TypeScript, RxJS.
- Backend/API: PHP/MySQL API according to README.
- Tooling: Angular CLI, Vitest/jsdom, Prettier.
- Deployment: OVH shared hosting.

## How To Run
- Install: `npm install`
- Start dev server: `npm start`
- Build: `npm run build`
- Test: `npm test`

## AI Notes
Read `README.md` and `SPEC.md` before editing. This project mixes public-facing content and private tools, so preserve route/auth boundaries.
