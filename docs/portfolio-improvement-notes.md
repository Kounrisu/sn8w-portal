# Portfolio: content and next steps

Private working notes. The public portfolio keeps employer names and mission dates discreet.

## Positioning

Experienced Angular front-end developer, with a banking background, shared component libraries, accessibility audits and developer training. This is relevant to banking, insurance and other teams maintaining complex business applications. Insurance is a target audience, not an employment history claim.

The public training section now says that intensive learning with Claude Code, ChatGPT and Frontend Masters is in progress. It does not claim an AI qualification or expertise.

The owner confirmed French and English as the only public website languages.
The profile now explicitly lists French and fluent English as working languages.
The other translation dictionaries remain in the repository as practice work,
but are not loaded or offered to visitors. Existing database translations are
left intact. The website language count is labelled separately from personal skills.

The owner is open to opportunities throughout France and Switzerland. This is
shown in the hero and contact copy; it does not imply German fluency, immediate
availability or a particular Swiss work authorization.

## Figures now shown

The accessibility section also shows the reference's 106 criteria and 13 topics,
explicitly labelled as RGAA 4.1.2 scope, not personal achievements or site
compliance. Source: https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/

The owner clarified that the aim is to present development experience with
accessibility, not to publish unverified audit or training counts. The older
full-compliance statement has been qualified: no criterion-by-criterion audit
supporting a score for this redesigned version is available in the project.

Recruiting context: new accessibility requirements apply to certain products and
services, including consumer banking services, since 28 June 2025. Scope and
exceptions depend on the service. This is context for the relevance of the
owner's experience, not a claim that every banking or insurance application has
identical obligations.
Source: https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/professionnels-vos-produits-et-services-doivent-etre-conformes-la-directive-accessibilite

| Figure | Existing evidence | What it means |
| --- | --- | --- |
| 10+ years | Career timeline starts banking development in 2015 | Front-end experience, not a count of projects |
| AngularJS to Angular 22 | Existing migration and component-library experience | Versions worked across, not 22 migrations |
| 750/1000 | Existing Opquast entry, dated 2026 | Individual digital-quality certification score, not this site's accessibility compliance |

The score has a proportional meter. The career timeline shows the existing sequence of roles. No estimated client counts, productivity percentages, skill percentages or performance gains have been added.

## Highest-value content to prepare

1. **A shared-component case study.** Describe one problem, your exact responsibility, a technical decision, and how teams used the result. Add a permitted anonymized example. Confirm how many applications or teams used the library before turning the existing approximate count into a headline.
2. **An accessibility case study.** Pick a real keyboard, focus, form or screen-reader issue. Show the starting behavior, the fix and how you verified it. Distinguish an automated check from a full audit.
3. **An Angular migration case study.** Explain one difficult compatibility or architecture decision, the migration stages and regression checks. Use before/after numbers only when you have records.
4. **A short AI learning record.** For three real changes, record the task, what Claude Code or ChatGPT proposed, what you changed or rejected, and the checks you ran. Link a commit or PR. Keep client code out of examples.
5. **A focused Frontend Masters list.** Add completed course names, dates and a small implementation demonstrating each useful skill. Separate completed courses from courses in progress.

Case-study outline: context -> responsibility -> constraints -> decision -> implementation -> verification -> result. A concise, inspectable example is enough; each does not need a long essay.

## Live catalogue findings

Public catalogue reviewed on 13 September 2026. No production records were changed.

- **Healthcorp** is the strongest first project for this audience. Its public description is only one sentence. Explain the rating inputs, the simulated data, your contribution, and why the interface is structured that way. Clarify the difference between the Healthcorp name and the risklens URL.
- **StockTracker Personal** has a real screenshot and a public demo, but no repository link in the catalogue. Add the repository if shareable, or a technical write-up. Discuss account modeling, financial calculations and the checks used for correctness.
- **lotoKarma** has a screenshot and repository. Keep it as a secondary example of data handling. Describe historical data and verification rather than implying frequency analysis predicts future random draws.
- **Lenormand** has a real interface and repository. It adds personality, but consider moving it to the workshop or lab for a banking-focused presentation.
- **books** is listed as flagship with no category, description or screenshot. The public selection now omits entries without a description; the record remains editable in admin. Complete those fields to make it appear, or move it to the workshop.
- **RGAA Dev Assistant** and **CI/CD Accessibility Pipeline** are currently prototypes, without public demos or repositories in the catalogue. They could become strong evidence after one inspectable workflow is available. Avoid presenting them as delivered products.

For each featured project: what it does, what you built yourself, one important technical decision, an actual screenshot, a repository/demo link, and an honest development status.

The uploaded screenshots are currently full-resolution PNGs. The browser reports an image-size warning at some small viewports. A future upload improvement should generate responsive WebP thumbnails alongside the original and expose them through srcset.

## Personal presentation

- The supplied smiling photo works as a small portrait. For a larger professional portrait, take a daylight head-and-shoulders photo with a plain background, no cap and no travel equipment. Keep it natural.
- Prepare a short PDF CV matching the site's role and experience wording, then add a download link when the public version is ready.
- Add a professional email alias on your own domain if you use one.
- Keep the earlier industrial career: it explains your process-improvement experience and international work. Summarize it after the development experience.
- Review the existing accessibility declaration after this redesign. An Opquast score is not evidence that the site is fully RGAA compliant.

## Design decisions

Unframed sections, neutral charcoal, restrained blue navigation, a warm accent for project numbers, consistent type sizes, and real product screenshots. Project screenshots preserve their full frame. The page shows work before the longer CV, and keeps the existing light and high-contrast settings.

## Local review

The visual preview reads the existing public project catalogue and screenshots. It forwards no logins, admin requests or writes. Analytics requests are handled locally.

Start the read-only API:

```powershell
node scripts/preview-api.mjs
```

In another terminal, start the site:

```powershell
npm start -- --host 127.0.0.1 --port 4201 --proxy-config proxy.preview.json
```

Open http://127.0.0.1:4201/. Internet access is needed for the public catalogue and fonts. The normal production API and deployment configuration are unchanged. Review this preview before pushing, because a push to main deploys the site.
