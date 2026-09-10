# CLAUDE.md

Working notes for Claude Code on this repo. For architecture, dev setup, and
the full deploy pipeline, read [README.md](README.md) first — this file is
only the operating rules on top of that.

## What this project is

Philippe Parmentier's personal site at sn8w.com: a CV/portfolio landing page
(Angular 22, zoneless, standalone components, signals) backed by a PHP/MySQL
API on OVH shared hosting, plus a private admin panel for the project list.
It's used in an active job search — a recruiter or CTO is a real reader of
this site, not a hypothetical one.

## Commands

```bash
npm start                                    # ng serve, proxies /api to localhost:4311
cd api && php -S localhost:4311              # local PHP backend (separate terminal)
npx ng build --configuration production      # always run before committing
npm test                                     # ng test --watch=false, always run before committing
```

**Node version**: this machine's default shell `node` is too old for Angular
22 (needs v22+). Use `source ~/.nvm/nvm.sh && nvm use v24.19.0` before any
`ng`/`npx` command if it fails with a version error.

**Port 4200 may already be in use by an unrelated project** on this machine —
check with `lsof -i :4200` before assuming the preview tool can bind it, and
fall back to another port rather than killing a process you don't recognize.

## Before every commit

1. `npx ng build --configuration production` — must be clean, no errors or new warnings.
2. `npm test` — must pass.
3. If you touched `.github/workflows/deploy.yml`'s injection step or anything
   that writes into `environment.prod.ts`, simulate it locally against a
   deliberately nasty string (an apostrophe, a quote, a backslash) before
   trusting it — a broken escaper there fails the *entire* production build
   silently until the next push.

## Database changes

Never run schema-altering or destructive SQL directly against the production
OVH database. Instead:
- Add a new numbered file under `api/migrations/` (idempotent where possible).
- Update `api/schema.sql` too, so a fresh install stays correct.
- Hand the user the exact SQL to run themselves via phpMyAdmin — don't ask
  for their DB credentials, and don't run it for them even if you could.
- A push that changes the API's expected columns will 500 in production
  between deploy and migration — say so explicitly and confirm the order
  (usually: user runs the migration, then you push).

## Git

- Commit freely; **never push or deploy without the user confirming first** —
  a push to `main` auto-deploys via GitHub Actions.
- Before a change with real blast radius (schema migration, wholesale visual
  rework, anything hard to unwind), offer an annotated tag as a checkpoint:
  `git tag -a <name> -m "..."` then `git push origin <name>`.
- Never force-push, never rewrite already-pushed history.

## i18n

Six languages: `en` (source of truth, typed interface in
`core/i18n/dictionary.ts`) plus `fr`, `de`, `ko`, `ja`, `es`, each
`satisfies Dict`. When editing `fr.ts` or `es.ts`, the Edit tool's exact-match
frequently fails on accented characters, non-breaking spaces before French
`?`/`!`, or apostrophes in words like "l'accès" — prefer a small Python
script (read, `str.replace`, write) over repeated Edit attempts. After
inserting a new key into one language file, grep all six to confirm the key
actually landed before moving on.

## Design direction

This site should not read as an AI-generated template. Concretely, avoid
landing on these without a deliberate reason: a warm cream background with a
high-contrast serif and a terracotta/dusty-rose accent, or a near-black
background with one neon/bright accent — both are extremely common defaults,
and the current "Lucky Squirrel" theme already sits close to the first one.
**Load the `frontend-design` skill before any non-trivial visual change.**

A colleague's from-scratch redesign proposal lives outside this repo at
`../vlad-mycv/philippe/` (docs + a working Angular scaffold) — genuinely
useful as a reference for critique and information architecture, but it has
its own opinionated visual direction. Treat it as inspiration to cherry-pick
from, not something to adopt wholesale, unless the user explicitly asks for
that.

## Content

Project cards (name, tagline, URL, repo, screenshot, online/offline status)
live in the database, edited via `/admin` — not in `api/schema.sql`'s seed
data, which only runs once against an empty table.
