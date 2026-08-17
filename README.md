# sn8w

The site and small private toolkit for [www.sn8w.com](https://www.sn8w.com): a public landing page (products, in 6 languages, in either of two switchable visual themes) backed by a database-driven admin panel, a todo board, and a daily diary — all on Angular 22 + a PHP/MySQL API, deployed to OVH shared hosting.

See [SPEC.md](SPEC.md) for the original design brief this started from. This README describes what actually got built, which has grown well past that brief — read this first if you're picking the project back up.

## What's here

- **`/`** — public landing page. Flagship products, ecosystem, and lab sections, all sourced live from the `projects` table via the PHP API. Available in English, French, German, Korean, Japanese and Spanish (switcher in the nav), and in two visual themes — "Night Sky" (dark, default) and "Lucky Squirrel" (warm, sakura-branch hero photo, falling-petal ambient canvas) — switchable in the nav, persisted per-browser.
- **`/login`** — signs in to the private area below. Single admin user, PHP session cookie auth.
- **`/admin`** — add, edit, delete the products shown on the landing page. Requires login.
- **`/todo`** — a three-column todo / in-progress / done board. Requires login.
- **`/diary`** — a daily log with its own per-day todo list. Requires login.
- Header shows the deployed semver version, short commit SHA, and deploy timestamp (tooltip on the version badge).

## Architecture

```
src/app/
  core/            services shared everywhere: AuthService, ProjectsService,
                   TodosService, DiaryService, ThemeService, i18n/ (translation
                   dictionary + per-language files + I18nService), models.ts,
                   auth.guard.ts
  landing/         marketing-page components (nav, hero, flagship-products,
                   product-ecosystem, engineering-principles, product-lab,
                   final-cta, site-footer, sakura-scene, status-badge)
  pages/           routed pages: landing-page, login-page, admin-page,
                   todo-page, diary-page
  app.routes.ts    all routing; /admin, /todo, /diary are behind authGuard
api/               PHP backend (PDO + MySQL), deployed alongside the built
                   Angular app onto the same OVH hosting — see api/schema.sql
                   for the 4 tables (admin_users, projects, todos,
                   diary_entries) and api/lib/ for the shared db/auth/http
                   helpers each endpoint requires first.
```

No Node.js runtime on the server — OVH's shared hosting plan only offers PHP, so the backend is plain PHP with PDO, not a Node API. (We tried Node first; it's not available on this hosting plan. If that ever changes, the PHP endpoints in `api/*.php` map 1:1 to what a Node/Express rewrite would need.)

Frontend: Angular 22, standalone components, zoneless change detection, signals throughout (no NgModules, no RxJS in components beyond `toSignal` at the edges), Angular Material + CDK skinned to the site's own tokens (never the default Material look), `HttpClient` with `withFetch()`.

Theming: every color is a CSS custom property (`--bg`, `--ink`, `--ice`, `--ember`, `--mist`, `--line`, `--line-strong`, `--surface-raised`, `--surface-sunken`, `--danger`) defined once in `src/styles.scss` for the default theme and re-defined under `html[data-theme='squirrel']` for the second theme. `ThemeService` just toggles the `data-theme` attribute and persists the choice to `localStorage`; nothing else needs to know a second theme exists.

i18n: `I18nService` holds a `Lang` signal and a typed `Dict` (see `core/i18n/dictionary.ts`) — every UI string lives in `dictionary.ts` (English, the source of truth for the type) plus one file per other language (`fr.ts`, `de.ts`, `ko.ts`, `ja.ts`, `es.ts`), each typed `satisfies Dict` so a missing key is a compile error. Product names/taglines themselves are **not** translated — they live in the database in whatever language they were entered (currently English); only UI chrome is translated.

## Development

```bash
npm install
npm start
```

Opens at `http://localhost:4200`. `npm start` runs `ng serve` with `--proxy-config proxy.conf.json`, which forwards `/api/*` to a local PHP server — see below to set that up.

### Local database + API

You'll need PHP (8.1+, for `pdo_mysql`) and a MySQL/MariaDB server locally.

1. Create a local database and apply the schema:
   ```bash
   mysql -u root -e "CREATE DATABASE sn8w_portal"
   mysql -u root sn8w_portal < api/schema.sql
   ```
2. Copy `api/lib/config.local.php.example` to `api/lib/config.local.php` (gitignored) and fill in your local DB credentials.
3. Create your own admin login — generate a bcrypt hash locally (never paste the plaintext password anywhere):
   ```bash
   php -r "echo password_hash('your-password', PASSWORD_BCRYPT), \"\n\";"
   ```
   then insert it:
   ```bash
   mysql -u root sn8w_portal -e "INSERT INTO admin_users (username, password_hash) VALUES ('you', '<hash>')"
   ```
4. Start the PHP server from `api/`:
   ```bash
   cd api && php -S localhost:4311
   ```
5. In another terminal, `npm start` from the repo root.

## Testing

```bash
npm test
```

## Building

```bash
npx ng build --configuration production
```

Output goes to `dist/sn8w-portal/browser/`. The production config swaps in `src/environments/environment.prod.ts`, whose `__APP_VERSION__` / `__COMMIT_SHA__` / `__DEPLOYED_AT__` placeholders get filled in by the deploy workflow — they're never committed with real values. The version (shown in the header) tracks `package.json`'s semver; bump that when you want the displayed version to change.

## Deployment

Pushes to `main` trigger [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds the Angular app, generates the PHP database config from secrets, and uploads everything to OVH shared hosting over SFTP — both the static build and the `api/` PHP files land in the same `www` folder, so the API is reachable at `https://www.sn8w.com/api/*.php`.

### One-time setup on OVH

1. In phpMyAdmin (or the OVH "SQL" tab), select the `snwxodokmod1` database, then run [`api/schema.sql`](api/schema.sql). This also seeds the existing product catalog (safe to re-run — every statement is idempotent and the seed only inserts if `projects` is empty).
2. Generate a bcrypt hash for your admin password the same way as in local dev, and insert your `admin_users` row directly via phpMyAdmin — the plaintext password should never touch this repo, chat, or GitHub secrets.

### Required repository secrets (Settings → Secrets and variables → Actions)

| Name                 | Value                                                  |
| -------------------- | ------------------------------------------------------- |
| `OVH_SFTP_HOST`      | `ftp.cluster015.ovh.net`                                 |
| `OVH_SFTP_USER`      | `snwxodok`                                                |
| `OVH_SFTP_PASSWORD`  | From OVH's "FTP-SSH" panel for this hosting account       |
| `OVH_DB_HOST`        | `snwxodokmod1.mysql.db`                                   |
| `OVH_DB_NAME`        | The database name from the OVH control panel              |
| `OVH_DB_USER`        | The database user from the OVH control panel               |
| `OVH_DB_PASSWORD`    | From OVH's database panel for this hosting account          |

The workflow fails fast with a named error if any of these are empty, rather than silently deploying with a blank credential.

### Gotchas hit while building this deploy pipeline (don't repeat them)

- **`wlixcc/SFTP-Deploy-Action@v1` doesn't exist** — only `v1.0`, `v1.2`, `v1.2.x` tags are published. Pinned to `@v1.2.6`.
- **`local_path: deploy/*` silently drops dotfiles.** Both the shell glob and the action's own SFTP `put -r` glob skip files starting with `.`, so `.htaccess` never reached the server even though the deploy step reported success. Fixed with a dedicated "Upload dotfiles" step that uploads them by exact filename via a plain `sftp -b <batchfile>` command, sidestepping globbing entirely.
- **Angular on Apache 404s on direct navigation to client-side routes** (`/login`, `/admin`, `/todo`, `/diary`) unless there's a rewrite rule — Apache has no `index.html` at those paths; Angular's router only takes over after `index.html` has already loaded. Fixed with `public/.htaccess` (copied into every build via Angular's `assets` glob), which serves real files/directories as-is (including `api/*.php`) and falls back to `index.html` for everything else.
- **PHP's default error output leaks server file paths.** An uncaught `PDOException` (e.g. querying a table that doesn't exist yet) dumps a raw stack trace with the absolute server path straight into the HTTP response. `api/lib/http.php` now installs a global exception/error handler on load that logs the real error server-side and always returns a clean `{"error": "Internal server error"}` JSON 500 instead.
- **`@angular/animations` must be a direct dependency**, not just implicitly resolved. `provideAnimationsAsync()` dynamically imports `@angular/animations/browser`; this resolved fine locally (stale `npm install` state) but broke on CI's clean `npm ci`, which only installs what's declared.
- **Local dev must use `npm ci`, not just `npm install`, to catch the above class of bug** before pushing — `npm install` is more forgiving about an undeclared-but-present package than the clean-slate `npm ci` that CI actually runs.

## Database

4 tables (see [`api/schema.sql`](api/schema.sql) for the full DDL): `admin_users` (your login), `projects` (everything on the landing page — `tier` is `flagship` / `ecosystem` / `lab`), `todos` (`status` is `todo` / `in_progress` / `done`; `diary_date` set when a todo belongs to a diary day instead of the general board), `diary_entries` (one row per day with saved notes).

If the OVH database accumulates unrelated tables over time (from other experiments on the same hosting account), only these four belong to this project — anything else is safe to drop independently, but back up first via phpMyAdmin's Export tab before dropping anything on the live database.

## Picking this back up later

Everything above reflects the actual shipped state as of the last deploy: Angular 22 zoneless app, PHP/MySQL API, 6 languages, 2 themes, working CI/CD to OVH. Nothing is a known-broken stub. If you're resuming work:

- `git log --oneline` tells the real story better than any summary — the commit messages describe *why*, not just *what*, for every non-obvious fix (see the gotchas above for the ones worth reading first).
- Product content (names, taglines, categories) lives in the database, not in code — edit it via `/admin`, not by editing `api/schema.sql`'s seed data (that only runs once, on an empty table).
- The hero photo (`public/images/sakura-branch.jpg`) is a real photograph (Unsplash License, free, no attribution required, credit: Jelleke Vanooteghem) — the "Lucky Squirrel" theme's earlier hand-drawn SVG attempts didn't hold up visually and were replaced with this.
