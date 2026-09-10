# Site ↔ CV Bridge

> Purpose: one place that says which content on sn8w.com and which
> content on your CV are *supposed* to say the same thing, where they
> currently don't, and why — so an edit to one side doesn't quietly leave
> the other stale. Companion to [content-audit.md](content-audit.md)
> (full site copy) and, once it exists, `cv-raw.md` (the CV source of
> truth this bridge will point to instead of the current `.docx`/`.pdf`
> files in `docs_sensitive/`).
>
> Compared against: `docs_sensitive/CV_Philippe_PAR_2026_new.pdf` (the
> Banque de France–oriented version — the most detailed one currently in
> that folder). Not all your CV variants say the same thing; this bridge
> will need re-checking once `cv-raw.md` consolidates them.

---

## 1. Identity & positioning

| | Site (hero) | CV |
|---|---|---|
| Employer | "a European central bank" (deliberately anonymized) | "Banque de France", named directly |
| Framing | "Front-End Angular Developer" | "Développeur Front-End Angular confirmé — Expertise Angular & accompagnement technique" |
| Tone | Personal, first-person, casual | Formal, third-person-adjacent, achievement-oriented |

**Decision needed**: is the site's anonymization deliberate (discretion while employed, or a house style rule at BDF about naming them publicly) or just never revisited? If deliberate, it's *correct* that these differ — not a bug. Mark it either way so future-you doesn't "fix" it by accident.

> NOTE:

---

## 2. Experience — the BDF role

The site's About timeline has **one condensed paragraph** for 2015–present.
The CV has **13 separate achievement bullets** for the same period, naming
real applications: BILAN, MODACWEB, NEUSGATE, CREDOR, SUREN2, PERSEE/FIBEC,
CEPH, ONEGATE, Ma Journée Surendettement, FIBEN, Portail WiFi.

This is the single biggest content gap on the site relative to the CV.
Options, not mutually exclusive:
- Keep the site condensed (portfolio sites usually should be — a wall of
  bullets reads as a CV pasted into a webpage) but mine 2–3 of the
  strongest bullets from the CV to sharpen the site's one paragraph.
- Add the named applications as a short list/chips under the timeline
  entry — concrete proof points a recruiter can skim.
- Leave it: the site is intentionally the "who I am" version, the CV is
  the "what I did, in detail" version, and that's a fine division of
  labor as long as it's deliberate.

> NOTE:

## 3. Freelance period (2014–2015)

Site: "A dozen short freelance missions... across hospitality, industry
and e-commerce clients." CV lists **every single mission** individually
(a game, ~10 PrestaShop/WordPress builds by client type, tech stack per
mission). Same pattern as §2 — CV is granular, site is a summary. Same
question applies: mine a couple of specifics, or leave the summary as-is.

> NOTE:

---

## 4. Skills

| Site | CV, not on site |
|---|---|
| HTML5, CSS3, SCSS, JS, TS, SQL, Java, Node.js, PHP | — |
| Angular (AngularJS–v21), React | — |
| RGAA, WCAG, digital sobriety audits | — |
| Training & mentoring | — |
| Git, GitLab, Jenkins, SonarQube, Jira, Figma, CI/CD | **WebStorm, IntelliJ, Sublime Text, Photoshop, Illustrator, Sketch, InVision, OpenShift (notions), SQL Server, MongoDB, Windows/macOS/Linux** |

The CV's tool list is meaningfully longer. Some of this (design tools:
Photoshop/Illustrator/Sketch/InVision) is arguably more CV-relevant than
site-relevant for a developer portfolio; some (OpenShift, SQL Server,
MongoDB) reads like real gaps in the site's skills section that a
technical recruiter skimming the site would want to see.

> NOTE:

## 5. Certifications & training

Site has: Plastics engineering degree, Opquast 750/1000, Access42, TOEFL,
boating licence, CAP Pâtissier/Chocolatier (the last two clearly
deliberate personal-color additions, not meant for a CV).

**Missing from the site, present on the CV**:
- **CESI — Mastère Amélioration Continue (2008–2009)** — directly
  relevant to the "ten years abroad in continuous improvement" story the
  site already tells; this is real supporting evidence for it.
- **Dale Carnegie Leadership (2009)** — not mentioned anywhere on the
  site currently.

> NOTE:

## 6. Languages

Site's "Outside the code" interests: French, fluent English, Japanese in
progress, a little Korean. **CV additionally lists German (basique)** —
absent from the site entirely.

> NOTE:

---

## Once `cv-raw.md` exists

This bridge should be re-run against it instead of the `.docx`/`.pdf`
files, since the raw CV will be the actual source of truth going
forward — themed CVs get generated *from* it, and this file is what
keeps the site from drifting away from whatever it says.
