# Moving the portal onto SN8W

Written on 2026-11-22. Portal at 16ddc2c, SN8W at c9d81be. Hub tickets: PORTAL-19 (the move) and
PORTAL-20 to PORTAL-22 (decisions), PORTAL-24 (icons first), PORTAL-25 (accessibility issues found). The SN8W tickets are SN8W-262 to SN8W-274.

## Where it stands

The portal does not use the SN8W packages. It runs on Angular Material (`mat-icon` 36 times,
`matTooltip`, `mat-menu` for the language menu, `MatSnackBar`) and on its own tokens in
`src/styles.scss`: `--space-*`, `--text-*` × `--text-scale`, `--ink`, `--line`, `--surface-*`,
`--success`/`--warning`/`--error`, three themes (frost, squirrel, contrast). Much of SN8W came from
here: the spotlight, the particles, the light palette (SN8W light is the portal's squirrel).

`/design-system` is an older copy of SN8W ("version 01"), built with portal styles. It should show
SN8W itself, or link to the SN8W docs.

## Component by component: who does best

"Using SN8W" means the portal uses SN8W's components, not only its colours. Each pair below was
compared in the code on both sides: accessibility, states, theming, small screens, code.
Score over 29 components: **SN8W best 17 · Portal best 4 · Tie 7 · SN8W only 1** (pagination). Of the portal's 4, the lightbox is one SN8W does not have at all.

| Component | Portal | SN8W | Best | Why |
|---|---|---|---|---|
| Button | CSS classes on `<a>` and `<button>` | `sn-button` | **SN8W** | 3 sizes, 7 colours, loading state announced; the portal has 4 variants |
| Link, external link | Automatic on every new-tab link, ↗ shown, text translated | `sn-link [external]`, set by hand, English text, no visible mark | Tie | The portal's directive is better for the site, SN8W's link is the better base (SN8W-269) |
| Badge | Outlined with a dot, visible in Windows high contrast | Filled tint, 7 colours, disappears as a shape in high contrast | Tie | Each has half (SN8W-268) |
| Alert | CSS only, the author adds the role | `sn-alert`: role chosen for you, title, actions, close button | **SN8W** | |
| Card, project card | Own composition, heading focusable | `sn-card`: the whole card is one link, heading level, slots | **SN8W** | Needs router links (SN8W-257) |
| Field, input, textarea | Valid state, icon inside the field | Label, hint and error wired for you, character count, requirements list, high contrast | **SN8W** | But SN8W lacks the valid state (SN8W-263) |
| Select | Native | Native, works with Angular forms | **SN8W** | |
| Checkbox, switch | Preferences "switches" are buttons | Real switch, hint, indeterminate, high contrast | **SN8W** | |
| Error summary | Takes focus, h4 heading | Same behaviour, h2 only | **SN8W** | Needs a heading level (SN8W-270) |
| Top nav | Two labelled navs when signed in, router links, height published for anchors, "settings changed" marker | One nav slot, `href` only, respects reduced motion | **Portal** | SN8W-265 |
| Language menu | Material menu with flags; options have no `lang` | `lang` and `hreflang` on each option, no flags, Escape returns focus | **SN8W**, blocked | SN8W only works with a URL per language (SN8W-266) |
| Theme toggle | Working service and button | No component: a CSS pattern only | **Portal** | SN8W should take the portal's (SN8W-274) |
| Display settings, preferences | 6 settings: reading font, letter and word spacing, 4 line heights | Better markup (fieldset, real switch, announced size), "follow the device", 5 settings | **Portal** (features) | SN8W-262 |
| Skip link | Animated even with reduced motion | Logical position, outline | **SN8W** (small) | |
| Side table of contents | Follows the section being read; labels invisible until hover; hidden below 1300 px | Visible labels, title, `aria-current="location"`, high contrast | Tie | Each has half (SN8W-264) |
| Footer | One "Contact" nav holds unrelated links; a tooltip on something that cannot take focus | Each group is its own labelled nav, accessibility link required | **SN8W** | Keep the portal's copy-email button |
| Toast, snackbar | Material, gone after 2.5 s, probably announced twice | At least 5 s, errors stay, pauses on hover or focus | **SN8W** | 2.5 s is too short to read (WCAG 2.2.1) |
| Tooltip | Material: follows on scroll | Shows on focus and hover, Escape, no dependency | Tie | |
| Dialog | Native `<dialog>` on the design-system page | Required title, focus trap, focus given back | **SN8W** | |
| Table | No caption, scroll area not reachable by keyboard | Caption names a focusable scroll area, sorting, high contrast | **SN8W** | |
| Reorder (admin) | Drag and up/down buttons; buttons don't name the item; position not announced | Item named, focus kept, new position announced | **SN8W** | SN8W lacks drag and table rows |
| Gallery lightbox | Arrows, Escape, focus kept inside, high contrast, reduced motion | None | **Portal** | SN8W-272 |
| Spotlight | One listener per element | One shared listener, skips disabled elements, hidden in high contrast | **SN8W** | Both ignore the in-app motion setting (SN8W-273) |
| Starfield, particles | Turns itself off for contrast and reduced motion | Cleaner drawing code, tested | Tie | Keep the portal's on/off rules on SN8W's drawing |
| Menu | Material menu: the right pattern for actions | Disclosure of links: right for navigation | Tie | SN8W has no action menu |
| Tabs | Own, arrow keys, Home, End | `sn-tabs`, same keyboard, reusable | **SN8W** | |
| Atelier filters | Links, current one marked by ✓ and bold; fixed size ignores the text-size setting | Tags: no "current" state for links | Tie | The portal already uses the class names `sn-tag`, `sn-tag-group`: rename before loading SN8W |
| Pagination | None | `sn-pagination` | SN8W only | |
| Empty state | Plain paragraph | `sn-empty-state` with a heading | **SN8W** | |

## Icons: the step that can be done first

The portal draws icons with the Material Icons font, loaded from Google (`src/index.html:19`):
a request to Google on every visit, and icon names can show as words ("dark_mode") until the
font arrives. SN8W icons are inline SVG in the page (no request, no font), drawn from the Aksel
set (MIT licence) and coloured by the text. The portal uses **24 Material icon names**. SN8W has 19
icons; 5 of them cover 7 of the portal's names. The other **17**, plus a sign-out icon, exist in the
Aksel set already in the SN8W repository, so SN8W only has to add them (SN8W-271).

| Portal (Material) | Where | SN8W today | Aksel icon to add |
|---|---|---|---|
| `dark_mode`, `light_mode` | Theme button (nav) | `moon`, `sun` | – |
| `arrow_forward` | Flagship products | `arrow-right` | – |
| `expand_more`, `keyboard_arrow_down` | Accessibility practices; admin reorder | `chevron-down` | – |
| `accessible`, `accessibility_new` | Settings button (nav); principles | `accessibility` | – |
| `keyboard_arrow_up` | Admin reorder | – | ChevronUp |
| `arrow_outward` | Hero | – | ExternalLink |
| `drag_indicator` | Admin reorder | – | DragVertical |
| `code` | Footer, practices | – | Code |
| `school` | Footer, practices | – | HatSchool |
| `work_outline` | Footer | – | Briefcase |
| `verified` | Footer | – | SealCheckmark |
| `mail_outline` | Footer | – | EnvelopeClosed |
| `construction` | Footer | – | Wrench |
| `account_tree` | Footer | – | Branching |
| `architecture` | Principles | – | Ruler |
| `devices` | Principles | – | Laptop |
| `speed` | Principles | – | Lightning |
| `widgets` | Principles | – | Component |
| `fact_check` | Principles, practices | – | ClipboardCheckmark |
| `groups` | Practices | – | PersonGroup |
| `draw` | Principles | – | Pencil |

The portal also draws 9 SVGs by hand (gallery expand, previous, next, close; search; select
arrow; sign in and out; the Atelier logo). The first six have SN8W or Aksel equivalents; the logo
stays the portal's.

**Why icons can go first:** they are drawings under the MIT licence, not SN8W's private code, so
they can be copied into the public portal without settling PORTAL-20. Plan (not done yet):
1. SN8W adds the 15 icons (SN8W-271).
2. The portal gets a small icon component rendering those SVGs; the 18 `mat-icon` and 6 hand-drawn
   SVGs are replaced; `MatIconModule` and the Google font link are removed.
3. Check every icon in light, dark and high contrast, at 200 % text size.

Visible change: the drawings change style (Aksel stroke instead of Material filled), lighter
on the page. Risk: low; one page at a time.

## Summary of what to do

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
