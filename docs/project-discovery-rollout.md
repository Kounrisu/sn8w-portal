# Project discovery

Import `api/migrations/009_project_discovery.sql` in phpMyAdmin with UTF-8 before deploying. Existing installations require 007; import the catalog 008 before 009 to classify its entries. This additive migration preserves later admin choices when rerun. It has not been executed against production.

Admin controls now separate site visibility from homepage featuring, with seven editable themes. Homepage shows at most six visible featured projects. `/projects` filters visible projects by theme and reveals batches of six. Counters exclude hidden projects and follow the selected filter. Ordering uses ascending sortOrder and then id for ties; existing admin reorder operations retain their tier/group numbering.

The compact screenshot gallery has manual inline controls and an optional native dialog. There is no autoplay or thumbnail strip. Arrow keys navigate; Tab/Shift+Tab wrap inside the dialog, Escape closes it, and native dialog focus restoration returns to the opener. Controls use visible focus and touch targets of at least 44px. The counter animates for 550ms, with final values alone announced to assistive technology; both OS and site reduced-motion preferences disable it.

Workshop ideas remain deferred in `workshop-ideas.md`. The homepage project introduction is shorter in French and English; the redundant reference disclaimer was removed from the RGAA figure.

Validation: production build and 16 unit tests; browser-local mock checks for 6/12/13 batches, filter reset, hidden totals, inline keyboard navigation, dialog focus/Escape, mobile overflow, reduced motion and homepage cap. This is targeted accessibility verification, not a complete RGAA audit. PHP syntax is checked with php-parser; no PHP/MySQL runtime or production database integration has been executed locally.
