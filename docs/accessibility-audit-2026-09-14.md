# Public accessibility audit - 14 September 2026

## Scope and result

This is a documented technical audit of the public portfolio, not a completed
criterion-by-criterion RGAA conformity evaluation. No RGAA percentage is claimed.

- Eight routes: `/`, `/projects`, `/behind-the-scenes`, `/login`, `/accessibilite`,
  `/plan-du-site`, `/workshop`, `/parametres-accessibilite`.
- French and English interface, dark/light/high-contrast themes: 48 axe scans.
- Chromium 152.0.7977.83 on Windows, Playwright CLI, axe-core 4.11.0.
- Rules: WCAG 2.0 A/AA, WCAG 2.1 A/AA and axe best practices.
- Automated retest: zero detected violations in all 48 configurations.
- Layout checks: 48 combinations of eight routes, two languages and three modes:
  320 CSS pixels, 200% root text size at 1280 CSS pixels, and increased text spacing
  at 320 CSS pixels. No horizontal overflow remained in these checks.
- These measurements do not establish that every text fragment remains legible
  in every possible combination of user preferences or browser zoom.

The production baseline was commit `7a08222`. Corrections were checked in the local
preview against the same public catalogue and images before publication.
No production data was changed by the tests. The failed-login test uses a mocked
401 response and does not submit credentials to the real authentication endpoint.

## Browser interactions

The recorded checks passed for:

1. Skip link is first in the tab order and moves focus to main content.
2. Accessibility disclosures open with Enter.
3. Gallery opens from the keyboard, contains focus, closes with Escape and returns
   focus to its trigger.
4. Project search shows its empty state; clearing it returns focus to the search field.
5. Motion is the first settings group.
6. Native radio groups support arrow-key selection for motion, reading font and theme.
7. The named bold-text toggle responds to Space and updates its exposed state.
8. Explicit reduced motion stops the canvas animation (pixel comparison over time).
9. An empty login is blocked by native required-field validation and focuses the field.
10. A simulated authentication error appears in an alert region.

Focus and ARIA checks were performed through browser interaction and DOM inspection,
not through a running screen reader. Screen-reader announcement quality is not verified.

## Findings addressed

This internal record preserves fixes; the public accessibility page contains results only.

- Invalid definition-list content: the Opquast meter now belongs to a `dd`.
- Ambiguous navigation landmarks: primary navigation and page sections have distinct,
  localized accessible names.
- Unnamed bold-text button: a localized accessible name is present.
- Light-theme online badges: the success colour was darkened after a measured 4.16:1 failure.
- Radio semantics and keyboard behavior: custom button radios replaced by native radios.
- Selection indication: radio labels use weight and underline as well as colour.
- Reduced-motion preference: both the saved preference and operating-system changes
  control the JavaScript canvas animation, not only CSS transitions.
- French statement content declares `lang="fr"` under the English interface.
- Skip-link wording follows the interface language.
- Login required fields use native validation and visibly identify required fields.
- Narrow-width/text-spacing overflow fixed on the changelog and accessibility report.

## Remaining validation

- axe still returns `incomplete` colour-contrast checks for composed backgrounds,
  pseudo-elements and some off-screen/overlapping content. These are not counted as passes.
- No NVDA, JAWS, VoiceOver or equivalent assistive-technology restitution tests were run.
- No exhaustive applicability/result matrix for the 106 RGAA criteria is completed.
- Authenticated administration, tasks, diary and analytics workflows were not tested
  in this public-site session; neither were external project applications or documents.
- Other browsers, operating systems, forced-colour mode, and all combinations of
  text/font preferences remain outside this report's tested environment.

Consequently, this evidence does not justify a “totally RGAA compliant” declaration.
It does justify reporting the zero-violation automated result and the specific browser
checks above. This is not a claim that untested features are inaccessible.

## Earlier audit found in Git

Commit `9fe0284a8a1ab6e1822f69015f60a1dca829c880` (10 September 2026) records
Claude's axe-core audit of the then-existing routes in both themes and zero remaining
violations after three fixes. That is genuine historical automated-test evidence.
No separate complete RGAA checklist was located in the repository during this review.

## Reproduction

Install the audit engine outside the application's dependencies:

```powershell
npm install --prefix output/audit-tools --no-save --package-lock=false axe-core@4.11.0
npx --yes --package @playwright/cli playwright-cli goto http://127.0.0.1:4201/
npx --yes --package @playwright/cli playwright-cli run-code --filename=scripts/audit-public-accessibility.js
npx --yes --package @playwright/cli playwright-cli run-code --filename=scripts/audit-accessibility-interactions.js
```

Open the desired origin before running the scripts. The local automated audit forwards
only public catalogue/image reads to production. Both scripts temporarily alter and
restore language/theme/preferences in the isolated browser session. Run sequentially.
Raw local outputs are in `output/accessibility-baseline.log`,
`output/accessibility-final.log` and `output/accessibility-interactions-final.log`.

Reference methodology:
https://accessibilite.numerique.gouv.fr/obligations/evaluation-conformite/

Criteria and tests:
https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/
