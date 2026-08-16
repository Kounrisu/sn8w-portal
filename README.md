# sn8w

Landing page and small private toolkit for [www.sn8w.com](https://www.sn8w.com) — an Angular SPA with a quiet, dark "night sky / drifting frost" theme, a PHP + MySQL API, and six languages (EN, FR, DE, KO, JA, ES).

Built with Angular 22 (standalone components, zoneless change detection, Router, HttpClient), Angular Material + CDK, and a Canvas 2D starfield background.

See [SPEC.md](SPEC.md) for the original design and build brief.

## What's here

- **Public landing page** (`/`) — flagship products, ecosystem, lab, all sourced from the `projects` table via the PHP API, in whichever of the 6 languages is selected.
- **`/admin`** — add, edit and delete the products shown on the landing page. Requires login.
- **`/todo`** — a three-column todo/in-progress/done board. Requires login.
- **`/diary`** — a daily log with its own per-day todo list. Requires login.
- **`api/`** — the PHP backend (PDO + MySQL), deployed alongside the built Angular app onto the same OVH shared hosting.

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

Output goes to `dist/sn8w-portal/browser/`. The production config swaps in `src/environments/environment.prod.ts`, whose `__APP_VERSION__` / `__COMMIT_SHA__` / `__DEPLOYED_AT__` placeholders get filled in by the deploy workflow (see below) — they're never committed with real values. The version (shown in the header) tracks `package.json`'s semver; bump that when you want the displayed version to change.

## Deployment

Pushes to `main` trigger [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds the Angular app, generates the PHP database config from secrets, and uploads everything to OVH shared hosting over SFTP — both the static build and the `api/` PHP files land in the same `www` folder, so the API is reachable at `https://www.sn8w.com/api/*.php`.

### One-time setup on OVH

1. In phpMyAdmin (or the OVH "SQL" tab), run [`api/schema.sql`](api/schema.sql) against the database OVH gave you (`snwxodokmod1.mysql.db`). This also seeds the existing product catalog.
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
