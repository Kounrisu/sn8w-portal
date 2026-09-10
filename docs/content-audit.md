# sn8w.com — Content Audit

> Working document. Every string on the public site, in one place, so you
> can mark up what needs to change without hunting through code or the
> admin panel. Base language: **English** (the codebase's own
> source-of-truth language — see `CLAUDE.md`'s i18n section). Say the
> word if you'd rather work from French instead.
>
> **How to use this**: read through, and under any block you want changed
> just write a line starting `> NOTE:` with what you want different. When
> you hand this back, I'll apply every NOTE and update
> [cv-bridge.md](cv-bridge.md) for anything that also touches the CV.
>
> **Where each block lives**: `dictionary.ts` = code (`src/app/core/i18n/dictionary.ts`,
> I need to edit it, and it changes text in all 6 languages if not
> re-translated). `database` = content you can already edit yourself in
> `/admin`, no code change needed.

---

## 1. Nav (`dictionary.ts` → `nav`)

| Label | Current text |
|---|---|
| Products link | Projects |
| About link | About |
| Contact link | Contact |
| GitHub link | GitHub |

> NOTE:

---

## 2. Hero (`dictionary.ts` → `hero`)

- **Kicker (location line)**: Paris, France
- **Name**: Philippe PARMENTIER
- **Role**: Front-End Angular Developer
- **Lede**: "I work mainly with Angular, currently at a European central bank in Paris, with a focus on accessibility (RGAA). This site doubles as my CV, and a place to share a few personal projects I'm building to learn."
- **Primary button**: See my experience
- **Secondary button**: View on GitHub

> NOTE: This is the single most CV-adjacent block on the whole page —
> it's the first thing a recruiter reads. Worth deciding deliberately:
> does "European central bank" (deliberately vague, presumably for
> public-facing discretion) match what you want here, given the CV names
> Banque de France directly? See [cv-bridge.md](cv-bridge.md) §1.

---

## 3. About (`dictionary.ts` → `aboutSection`)

**Kicker**: About
**Title**: A bit about my background
**Lede**: "Front-end Angular developer based near Paris. Since 2015 I have worked in the team that builds and maintains a European central bank's shared component library: AngularJS to Angular 21 migrations, RGAA/WCAG accessibility, CI/CD pipelines, and day-to-day support for the teams building on it. Before development I spent ten years abroad — in England, then the United States — running continuous improvement on industrial sites — automotive, then cosmetics, then ophthalmic polycarbonate lenses. That is where the habit of method, documentation and cross-team work comes from."

> NOTE:

### Experience timeline

1. **2015 — Present · Front-End Angular Developer · European central bank, Paris**
   "Building and maintaining a shared Angular component library used across a dozen internal applications. Leading migrations from AngularJS to Angular 21, running RGAA accessibility audits, and designing and delivering the accessibility training developers take — building the materials myself and checking the ideas actually land, not just handing off a slide deck. Supporting project teams end to end — from UX workshops and Figma handoff through estimation, integration and CI/CD (Jenkins, SonarQube)."
2. **2014 — 2015 · Freelance Front-End Integrator · Wizzmedia · 3W Agency**
   "A dozen short freelance missions: PSD/Illustrator-to-responsive integration for e-commerce (PrestaShop), several WordPress builds, and an AngularJS game — across hospitality, industry and e-commerce clients."
3. **2012 — 2014 · Career switch into web development · 3WA Web Academy · IESA Multimedia**
   "Retrained in web development and multimedia — HTML5/CSS3/JavaScript foundations through to a full front-end portfolio, after a decade in industrial process improvement."
4. **Six years — United States · Continuous Improvement Project Manager · Ophthalmic polycarbonate lenses**
   "Ran cross-functional improvement projects on a polycarbonate spectacle-lens production line: performance indicators (KPIs), and coordination across the production, quality and engineering teams."
5. **Three years — United Kingdom · Continuous improvement, industrial sites · Automotive, then cosmetics**
   "First roles abroad, on automotive and later cosmetics production lines — workstation analysis, scrap reduction and hands-on support for shop-floor teams, before six years in the United States."

> NOTE: The site's timeline is 5 condensed entries. Your CV's "Banque de
> France" entry alone has 13 detailed achievement bullets and names real
> applications (BILAN, MODACWEB, NEUSGATE, CREDOR, SUREN2, PERSEE/FIBEC,
> CEPH, ONEGATE, Ma Journée Surendettement, FIBEN, Portail WiFi) — none of
> that granularity is on the site. See [cv-bridge.md](cv-bridge.md) §2.

### Skills (`skillsGroups`)

- **Languages**: HTML5, CSS3, SCSS, JavaScript, TypeScript, SQL, Java, Node.js, PHP
- **Frameworks**: Angular (AngularJS – v21), React
- **Accessibility & UX**: RGAA, WCAG, digital sobriety audits
- **Training & mentoring**: Designing training materials, running workshops, checking understanding rather than just presenting
- **Tools**: Git, GitLab, Jenkins, SonarQube, Jira, Figma, CI/CD

> NOTE: CV also lists WebStorm, IntelliJ, Sublime Text, Photoshop,
> Illustrator, Sketch, InVision, OpenShift (notions), SQL Server, MongoDB,
> Windows/macOS/Linux — none of that is on the site. Worth deciding what's
> worth surfacing publicly vs. CV-only detail.

### Outside the code (`interestsGroups`)

- **Languages**: French, fluent English, Japanese in progress — and a little Korean
- **Sport**: Karate, krav maga, and a lot of walking — Paris daily by Vélib'
- **At sea**: Kitesurfing and coastal sailing, usually at Le Grau-du-Roi near Montpellier
- **Watching**: Korean and Japanese series, which is where this site's mood comes from
- **Garage**: A Buell brought back from the United States
- **History**: Second World War reenactment, done in England — and the itch to pick it up again in France, on the US Army side
- **Music**: Learning the guitar. On the listening side: country, some international rap, and Manau

> NOTE: CV's formal "Langues vivantes" also lists German (basique) —
> not mentioned anywhere on the site.

### Certifications & training

- Plastics engineering degree — ESP, now part of INSA Lyon
- Opquast — Digital Quality Reference Framework, 750/1000 (2026)
- Access42 — Web Accessibility Training (2020)
- TOEFL iBT 105/120 — fluent English (2010)
- Coastal boating licence · driving licence (category B)
- CAP Pâtissier and CAP Chocolatier — sat as an independent candidate, for the pleasure of learning

> NOTE: CV also has **Dale Carnegie Leadership (2009)** and **CESI —
> Mastère Amélioration Continue (2008–2009)** — both missing from the
> site. See [cv-bridge.md](cv-bridge.md) §3.

---

## 4. Flagship projects (`database`, tier = `flagship`, live content)

| # | Name | Category | Tagline | Status | URL |
|---|---|---|---|---|---|
| 1 | Healthcorp | Finance | Credit-risk rating platform. | In development | risklens.sn8w.com |
| 2 | StockTracker Personal | Finance | One dashboard for every account — PEA, PER, CTO — with the KPIs that matter. | In development | lucky-stocks.sn8w.com |
| 3 | lotoKarma | Consumer | A modern web app for FDJ lottery players — Loto, EuroMillions and Crescendo. lotoKarma lets you generate number grids, check them against the complete draw history, browse the archives, and analyze frequency statistics to refine your choices. | In development | lotokarma.sn8w.com |
| 4 | Lenormand | Experimental | Cartomancy: shuffle, cut, draw — just like with a real deck. | In development | lenormand.sn8w.com |

> NOTE: this table is editable today via `/admin` — no code change
> needed for wording, order, or which projects appear here at all.
> lotoKarma's tagline is noticeably longer than the other three — worth
> deciding if that's intentional or should be trimmed for consistency.

---

## 5. Ecosystem projects (`database`, tier = `ecosystem`, live content)

| Group | Name | Tagline | Status |
|---|---|---|---|
| Consumer | Destroy Bad Emails | Swipe your way to inbox zero, with levels and streaks. | Prototype |
| Developer Tools | VS Code Accessibility Helper | Accessibility guidance in the editor — Angular templates, ARIA, focus order. | Prototype |
| Developer Tools | CI/CD Accessibility Pipeline | Axe-core and Playwright wired into pull requests, so regressions never ship. | Prototype |

> NOTE:

---

## 6. Lab / experiments (`database`, tier = `lab`, live content)

| Name | Category | Tagline | Status |
|---|---|---|---|
| RGAA Dev Assistant | Developer & Accessibility Tools | Live DOM inspection that turns RGAA and WCAG issues into fixes your team can actually ship. | In development |
| Kawaii Pet Companion | Lab | A virtual pet with a care journal and mini-games. | Prototype |
| Passive Income Tracker | Finance | Dividends and passive income, tracked against a real independence goal. | Concept |
| K-Pop Affinity | Lab | Discover the artists and groups that match your taste. | Prototype |
| Solis | Creative | Pick an image, choose a style, watch it transform. | Prototype |
| Legio Portfolio | Finance | Premium investment analytics with a distinctive Roman identity. | Prototype |
| K-Pop Universe | Lab | An encyclopedia of K-pop — timelines, groups, recommendations. | Prototype |
| Executive KPI Dashboard | Finance | Modern business analytics built for the boardroom. | Prototype |
| WoW Progress Companion | Lab | Raids, gear and weekly objectives, for every alt. | Prototype |
| Brain Sakura | Lab | A gentle companion concept designed for senior users. | Prototype |

> NOTE: This block reads as a mix of genuinely portfolio-relevant ideas
> (RGAA Dev Assistant, Passive Income Tracker) and purely personal-fun
> ones (K-Pop Affinity, K-Pop Universe, WoW Progress Companion). Worth
> deciding per-item whether it belongs on a job-search-facing homepage —
> this is the "some projects I don't want to display" question from your
> bigger ask, and ties into the admin display-toggle work.

**Section copy**: kicker "Experiments", title "Just for fun", lede
"Ideas explored out of curiosity, to learn new technologies and
approaches.", per-item tag "[prototype]".

> NOTE:

---

## 7. How I work / principles (`dictionary.ts` → `principlesSection`)

**Kicker**: How I work · **Title**: A few habits I try to keep
**Lede**: "Nothing formal — just habits that carry over whether it's a work project or something small on the side."

| Item | Title | Description |
|---|---|---|
| 1 | Accessibility by design | RGAA and WCAG checked before launch, not bolted on after. |
| 2 | Modern Angular architecture | Standalone components, signals, zoneless — no legacy patterns. |
| 3 | Responsive interfaces | Designed for the smallest screen first, not stretched from desktop. |
| 4 | Performance | Small bundles, fast interactions, no framework bloat. |
| 5 | Reusable design systems | Typed components and tokens, shared across every project. |
| 6 | Testing | Unit tests and accessibility audits as part of the build, not an afterthought. |
| 7 | Thoughtful UX | Every screen earns its place — nothing ships just to fill space. |

> NOTE:

---

## 8. Call to action (`dictionary.ts` → `ctaSection`)

**Title**: Want to see more?
**Lede**: "Everything here starts as a repository on GitHub — feel free to look around, or get in touch."

> NOTE:

---

## 9. Footer (`dictionary.ts` → `footer`)

GitHub · Copy email · Deployed commit / deployed at / local build ·
Accessibility · Sitemap

> NOTE:

---

## Other public pages (lighter detail — not CV-facing, flag if any should change)

- **Behind the scenes** (`/behind-the-scenes`): "How this site is actually held together" — build stack, changelog straight from git log.
- **Accessibility statement** (`/accessibility`): RGAA declaration.
- **Sitemap** (`/sitemap`): plain page list.
- **Analytics** (`/analytics`, admin-only): self-hosted visit stats.

---

## Admin-only pages (not public, listed for completeness)

- **Login**, **Todo board**, **Diary**, **Admin (project management)** —
  functional tools, not CV/portfolio content. Flag here only if you want
  wording changed.
