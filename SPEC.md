I want to build a personal portfolio landing page for www.sn8w.com, as its own standalone repo — this used to live inside a different repo alongside another project and I'm starting it fresh here, separated out.

What to build
An Angular 22 app (latest stable), standalone components, zoneless change detection, SCSS. Single page, no routing needed. Design: a quiet, dark "night sky / drifting frost" theme —

Palette: near-black cool ground (#0a0d12), ice-blue accent (#a9d8ea), a single warm ember accent (#e0895a) used sparingly on hover, muted text tones. Dark-only design (no light theme needed) — it's a deliberate single-world aesthetic.
Typography: serif display face for the wordmark/headline (ui-serif, 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', Georgia, serif), monospace for small labels/kicker text/ the version footer (ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', monospace), a plain system sans for body copy.
Content: a wordmark "sn8w" (the "8" in ice-blue, rest in main text color), a one-line tagline describing quietly working across different projects, then a row of project cards — one linking out to https://risklens.sn8w.com (a credit-risk rating platform, marked "Live"), and 1-2 more marked "In progress"/"Building" for future projects (a lottery/numerology app, and a placeholder "next thing" slot).
Motion: an ambient canvas starfield/frost-particle background (slow drifting dots with a twinkle effect), driven by requestAnimationFrame in a component lifecycle hook (not a three.js/animation library — plain Canvas 2D). Respect prefers-reduced-motion by freezing the drift (still render static particles). A gentle staggered fade-up entrance animation on page load for the headline/tagline/cards (CSS @keyframes, respecting reduced-motion too).
Footer: links to GitHub and a contact email, plus a small version label showing the deployed git commit's short SHA (see deployment section below for how that gets injected).
This is also a practice project — use it to learn, not just to ship
I want real hands-on practice with modern Angular tooling here, so make deliberate, well-motivated use of:

Angular Material + CDK — don't skip these just because the page is simple; find genuine, non-contrived places for them. Good fits for this exact page:

@angular/cdk/clipboard — clicking the footer email copies it to the clipboard.
Material MatSnackBar — confirms the copy with a brief toast, themed to match the dark palette (Material's M3 theming supports full custom tokens — don't let it look like default Material blue-on-white; skin it to the site's own palette).
@angular/cdk/a11y LiveAnnouncer — announce the copy action for screen-reader users too, not just the visual snackbar.
@angular/cdk/layout BreakpointObserver — drive any responsive behavior (e.g. particle density, card grid columns) through this instead of CSS-only media queries, for the practice.
MatIconModule/MatTooltipModule where they genuinely improve something (e.g. an icon + tooltip on the version badge explaining it's the deployed commit).
Skip anything that doesn't have a real reason to be there — the goal is genuine practice with the APIs, not checkbox-ticking every module that exists.
RGAA compliance (France's public-sector accessibility standard, WCAG 2.1 AA–based — relevant since I'm targeting a French employer). Concretely:

<html lang="fr"> or "en" matching actual page language; one <h1> (the wordmark); proper landmark structure (<main>, <footer>, <nav> if applicable).
Verify color contrast meets AA (4.5:1 for body text, 3:1 for large text/UI elements) — check the ice-blue-on-dark and ember-on-dark combinations actually pass, adjust if not.
Every interactive element (cards, footer links, the new copy-email action) must be fully keyboard-operable with a visible focus indicator — not just :hover.
The decorative canvas starfield stays aria-hidden="true" (already planned) since it conveys no information.
Respect prefers-reduced-motion throughout (already planned for the particles/entrance animation) — this is also an RGAA/WCAG requirement (2.3.3), not just a nice-to-have.
Run an accessibility audit before calling it done (Lighthouse's accessibility score, or axe DevTools) and fix anything it flags.
Design process
Before writing component code, work through an actual design plan first — don't jump straight to CSS. If a UX/UI-oriented design skill is available in this session (Claude has one for crafting polished pages — check what's available and load it if so), use it to sanity-check the plan below against generic AI-design defaults (the warm-cream-serif-terracotta look, purple-gradient-on-white heroes, Inter/Space Grotesk everywhere, rounded-lg cards with an accent rail — none of that belongs here) and refine deliberately: confirm the palette/type choices are specific to this site rather than generic, decide exactly where the one motion "risk" (the entrance sequence, the particle drift) earns its place, and keep everything else quiet around it. Write down the token plan (colors as named hex values, the two-plus type roles, the layout concept in a sentence) before building, the same discipline as a real design handoff — then implement it.

Version footer mechanism
Use Angular's environment file + fileReplacements pattern:

src/environments/environment.ts: { production: false, version: 'dev' }
src/environments/environment.prod.ts: { production: true, version: '__VERSION__' } (a literal placeholder string)
Wire fileReplacements in angular.json's production build config to swap environment.ts for environment.prod.ts.
The deploy workflow (below) replaces __VERSION__ with the real short commit SHA via sed at build time, so the placeholder never gets committed with a real value.
Deployment: OVH shared hosting via SFTP
This deploys to existing OVH shared hosting (not a VPS, not Vercel/Netlify) — the account is ftp.cluster015.ovh.net, and www.sn8w.com is mapped (via OVH's "Multisite" hosting config) to a folder that must be referenced as www, not /www — the leading slash breaks the SFTP upload (sftp> lands you in the account home directory, and an absolute path there isn't valid; this cost real debugging time to figure out, worth getting right the first time).

Use a GitHub Actions workflow (.github/workflows/deploy.yml) on push to main:

Checkout, setup Node 24, npm ci
sed -i "s|__VERSION__|${GITHUB_SHA::7}|" src/environments/environment.prod.ts
npx ng build --configuration production
Assemble a clean deploy folder via rsync (excluding .git, node_modules, .env*) from dist/<project-name>/browser/
Before the actual SFTP step, add a small diagnostic step that checks each required secret (OVH_SFTP_HOST, OVH_SFTP_USER, OVH_SFTP_PASSWORD) is non-empty via [ -z "$VAR" ] checks in bash, failing with a clear named error if any are missing — a mismatched/misnamed GitHub secret silently resolves to an empty string with no error otherwise, which wasted a lot of time last time before this check existed.
Deploy via wlixcc/SFTP-Deploy-Action@v1 with sftp_only: true, remote_path: www (no leading slash — see above).
Required GitHub repository secrets (Settings → Secrets and variables → Actions → Repository secrets)
Name	Value
OVH_SFTP_HOST	ftp.cluster015.ovh.net
OVH_SFTP_USER	snwxodok
OVH_SFTP_PASSWORD	(get/reset this from OVH's "FTP-SSH" panel for this hosting account)
Watch out for browser autofill when entering these — Safari's saved-password autofill can silently substitute an unrelated saved credential into the Name or Value field without it being obvious. Dismiss any autofill suggestion popup before typing, and visually re-check what actually got saved (the secret name shown in GitHub's list) before moving on — this happened once already and produced a very confusing debugging session chasing a secret that was never actually named right.

What NOT to do
Don't deploy this to a VPS or set up Docker/Caddy for it — that was tried and deliberately abandoned in favor of the simpler OVH shared-hosting SFTP path. Keep it simple.
No backend, no API calls, no HTTP client needed — this is a purely static page (Material/CDK are for the interactive touches described above, not a reason to add a backend).
Don't let Material's default look show through — theme it fully to the site's own dark palette, never generic Material blue/purple on white.
Process
Build it directly (this is a small, well-specified single page, no need for an upfront architecture proposal/confirmation step) — scaffold the Angular app, build the component with the design described above, set up the deploy workflow, and do a real production build locally to verify it compiles before considering it done. Ask me for the actual OVH_SFTP_PASSWORD value only to enter directly into GitHub's secret field yourself — never have me paste it into chat.
