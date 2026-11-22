# Moving the portal onto SN8W

Written on 2026-11-22. Portal at 16ddc2c, SN8W at c9d81be. Hub tickets: PORTAL-19 (the move) and
PORTAL-20 to PORTAL-22 (decisions). The SN8W tickets are SN8W-262 to SN8W-273.

## Where it stands

The portal does not use the SN8W packages. It runs on Angular Material (`mat-icon` 36 times,
`matTooltip`, `mat-menu` for the language menu, `MatSnackBar`) and on its own tokens in
`src/styles.scss`: `--space-*`, `--text-*` × `--text-scale`, `--ink`, `--line`, `--surface-*`,
`--success`/`--warning`/`--error`, three themes (frost, squirrel, contrast). Much of SN8W came from
here: the spotlight, the particles, the light palette (SN8W light is the portal's squirrel).

`/design-system` is an older copy of SN8W ("version 01"), built with portal styles. It should show
SN8W itself, or link to the SN8W docs.

## Piece by piece

R = replace with SN8W · P = the portal does better, improve SN8W first · M = SN8W lacks it · K = keep the portal's own.

| Portal | SN8W | | Why |
|---|---|---|---|
| Spacing, content width | `--sn-layout-*` | R | Same values |
| Type scale × text size | `--sn-font-size-*`, root size | R | Same sizes and fonts |
| Themes frost, squirrel, contrast | light, dark, contrast | R + decision | Light is identical; dark differs (PORTAL-21) |
| Durations (0.18 s written in) | `--sn-duration-*` | R | |
| `--mat-sys-*` overrides | – | R | Go with Material |
| Material icons font (loaded from Google) | `sn-icon`, inline SVG | M | 18 icons missing (SN8W-271) |
| Language menu with flags | `sn-language-selector` | M + decision | SN8W needs links (SN8W-266); flags (PORTAL-22) |
| Preferences page | `<sn-display-settings>` | **P** | Reading font, letter and word spacing, kept settings (SN8W-262) |
| Skip link, focus styles, visually hidden | `.sn-skip-link`, base focus | R | |
| Focus to `<main>` and route announced | – | M | SN8W-267 |
| Top nav: two rows when signed in, measured height | `sn-top-nav` | **P** | SN8W-265 |
| Side table of contents with scroll-spy | `sn-in-page-navigation` | **P** | SN8W-264 |
| Footer, copy email | `sn-footer` | R | Keep the copy button |
| Snackbar, tooltip, buttons | `SnToastService`, `snTooltip`, `sn-button` | R | |
| Project cards | `sn-card` | R | Router links (SN8W-257) |
| Status badge: outline and dot | `sn-badge` (filled) | **P** | Survives forced colours (SN8W-268) |
| Alerts with icons | `sn-alert` | R | Same |
| Fields: valid state, icon in the field | `sn-field`, `sn-input` (invalid only) | **P** | SN8W-263 |
| Contact error summary | `sn-error-summary` | R + M | Heading level (SN8W-270) |
| Admin tables, reorder by drag or buttons | `sn-table`, reorderable list | R | |
| Gallery lightbox (arrows, focus kept) | – | M | SN8W-272 |
| External links marked on every new-tab link | `sn-link [external]` | **P** | Automatic directive (SN8W-269) |
| Spotlight | `@sn8w/core` spotlight | R | Both ignore the in-app motion setting (SN8W-273) |
| Starfield, hero, glass panels, kicker, logo | particles, typography | K | The portal's identity |
| Sakura scene | – | K | Not used by any page: can be removed |

## Blockers

1. **The portal repo is public, SN8W is private.** Copying SN8W source into the portal (as the hub
   does) would publish it. Choices in PORTAL-20.
2. Theme names and stored settings differ (`frost`/`squirrel` vs `dark`/`light`; `sn8w-theme`,
   `sn8w-a11y-prefs` vs `sn8w-display-settings`): a migration keeps visitors' choices.
3. SN8W `base.css` sets global element rules that may clash with the portal's.

## Order, smallest risk first

1. Decide how the portal gets SN8W (PORTAL-20); add it with no visible change.
2. Point the portal's variables at SN8W tokens, map the theme names.
3. Visually hidden, skip link, focus.
4. Buttons, alerts, tooltip, toast, cards, footer.
5. Icons, once SN8W has them; drop the Material icons font.
6. Forms and error summary, once SN8W has the valid state.
7. Tables and dialogs.
8. Nav, language menu, table of contents; then drop `@angular/material` (CDK stays).
9. Preferences, with the settings migration.
10. The design-system pages.

Not checked in detail: the todo, diary, analytics, messages and login pages; SN8W top nav on
mobile; contrast of SN8W dark against the portal's newer status colours.
