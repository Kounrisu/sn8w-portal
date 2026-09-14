# Screenshot showroom: review and rollout

The local implementation has 27 real browser captures across 16 project folders. The inventory covers all 23 non-configuration folders in `C:/dev/dev-projects`; empty folders, course material, third-party references and non-web tools are explicitly identified in [the inventory](project-screenshot-inventory.md). Six existing live apps are initially shown: Healthcorp, StockTracker Personal, lotoKarma, Lenormand, Kanji and books. Seventeen additional project records start hidden; existing idea records are retained. The admin table and edit form both offer **Show in showcase / Afficher dans la vitrine**, independent of tier, availability and development status.

Screenshots open an image dialog with thumbnails, previous/next, arrow keys, Escape and native focus handling. App links remain in the adjacent text. Existing single-cover uploads continue to work. The edit form accepts additional local image paths, one per line; reorder or remove these lines to edit the gallery. Uploading a cover replaces only the cover. Removing a cover does not remove additional images. Packaged screenshots are never physically deleted by the upload endpoint.

The English and French showcase introduction explains the owner's intent: these personal apps remain works in progress used to learn AI tools and refine the whole design, correction, improvement, testing and deployment workflow while controlling token consumption. Playful ideas are also practical learning exercises; workflow efficiency is presented as an ongoing objective, not a measured achievement.

The learning goals also cover frontend and backend exploration, deeper Python, Java and SQL knowledge, PostgreSQL, React alongside Angular, containers and DevOps. Code quality and security are ongoing practices to strengthen, including readability, maintainability, checking changes and protecting data. These are expressed as learning intentions, not claims of established expertise or completed security audits.

Data processing is illustrated by Photo Book Scanner: inspected Python code runs CLIP locally to classify likely book-cover photos. A 50,000-photo library is an example workload for comparing local and online analysis, not a completed run or a quantified savings claim. The comparison considers cost, accuracy, processing time and privacy.

## Production order

Production has **not** been changed. The repository's `CLAUDE.md` requires SQL imports by the owner and explicit approval before a push, which automatically deploys.

1. Export `projects` and `project_translations` from phpMyAdmin as a backup.
2. Import [`007_project_galleries.sql`](../api/migrations/007_project_galleries.sql) with UTF-8 selected. It adds nullable JSON-text gallery data and a visibility flag. Existing flagship selections are preserved. It is safe to re-run.
3. Approve the portal commit/push/deployment. Deploy the Angular image assets and updated PHP together. **Do not deploy the new admin writes before step 2**: those writes require the new columns. Public reads tolerate an older schema, but admin create/gallery/visibility saves would fail until migration.
4. Once deployed assets return HTTP 200, import [`008_showroom_catalog.sql`](../api/migrations/008_showroom_catalog.sql) with UTF-8 selected. It maps the six live projects by their observed ID and name, corrects Books/Kanji English and French descriptions, and inserts the seventeen missing catalog entries. Run after asset deployment to avoid broken public image paths. Existing galleries are left alone on re-import; French Books/Kanji descriptions are reapplied.
5. Open `/admin`, choose which entries to show, and review the public page in English and French. The toggle hides an entry from the rendered showcase; it is not a privacy/access-control mechanism for the public catalog API.

No credentials are needed in chat. No production migration, push or deployment has been performed.

Fighto is also prepared as a future project, bringing the inventory to 24 entries: the 23 workspace folders plus this planned application. It has concept status, English and French descriptions, no URL or screenshots, and starts hidden for the owner's final selection. Its intended scope is time management, goals, focus, food habits, diabetes tracking and physical activity, especially walking and exercise tracking; no implemented medical capability is claimed.

## Files and regeneration

- Source inventory and capture names: `scripts/showroom-catalog.json`.
- Original screenshots for local QA: `output/playwright/*.png` (ignored by Git).
- Versioned full-size, preview and thumbnail WebPs: `docs/images/projects/<slug>/`.
- Identical versions in the source project: `<project>/docs/images/projects/` (the portal uses its own slug folder).
- Angular publishes the portal image directory under `/images/projects/` automatically; no third manually maintained public copy is required.
- Run `node scripts/prepare-showroom.mjs` after taking or refreshing the named PNG captures. It regenerates image variants, the SQL content import, inventory and preview overlay. To regenerate on another machine, first recapture the PNGs named in the manifest; those originals are local QA artifacts.
- Screenshots of demo data are identified in the inventory. Course starters, static placeholders and third-party tools are not represented as finished original products.

## Read-only preview

```powershell
$env:PREVIEW_API_PORT='4313'
$env:SHOWROOM_PREVIEW='1'
node scripts/preview-api.mjs
# Separate terminal
npm start -- --host 127.0.0.1 --port 4216 --proxy-config proxy.showroom.json
```

This overlays the proposed catalog on public live reads. It does not forward writes or provide an admin login. Admin verification used a browser-local, in-memory API mock, not production authentication or database writes.

## Verification

- Production Angular build passes; 13 tests pass, including legacy single-image fallback, gallery deduplication and image navigation.
- Desktop/mobile screenshots inspected; real browser verification covered opening, arrow navigation, Escape and showcase visibility changes against local API mocks.
- PHP 8.3 grammar parse passes for all three changed PHP files. PHP runtime and MySQL integration were not executed: PHP is not installed and the local Docker database runtime is unavailable.
- `21st review` flags Angular `[alt]` bindings as missing static `alt` attributes. These are false positives: rendered screenshot images have descriptive accessible text, and decorative thumbnails have empty alt text. Its backdrop-color advisory is intentional; other styling reuses portal tokens.
- The pre-existing canvas warning in the unit suite remains; it does not fail tests.
