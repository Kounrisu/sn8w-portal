import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { Lang } from '../../core/i18n/dictionary';

/**
 * A small inline SVG flag for the language switcher.
 *
 * Drawn rather than done with emoji (🇫🇷 …): Windows ships no flag glyphs, so
 * every regional-indicator pair falls back to its two letters — "FR", "DE" —
 * which is what a large share of visitors would see.
 *
 * Purely decorative. The switcher always carries the language's own name as
 * text, so nothing here needs to be announced; a flag is a country, not a
 * language, and should never be the only thing naming one.
 */
@Component({
  selector: 'sn8w-flag',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: inline-flex;
      width: 1.25rem;
      flex: 0 0 auto;
    }
    svg {
      width: 100%;
      height: auto;
      border-radius: 2px;
      display: block;
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--line-strong) 60%, transparent);
    }
  `,
  template: `
    @switch (lang()) {
      @case ('fr') {
        <svg viewBox="0 0 9 6" aria-hidden="true">
          <rect width="9" height="6" fill="#fff" />
          <rect width="3" height="6" fill="#002654" />
          <rect x="6" width="3" height="6" fill="#ce1126" />
        </svg>
      }
      @case ('de') {
        <svg viewBox="0 0 9 6" aria-hidden="true">
          <rect width="9" height="2" fill="#000" />
          <rect y="2" width="9" height="2" fill="#dd0000" />
          <rect y="4" width="9" height="2" fill="#ffce00" />
        </svg>
      }
      @case ('es') {
        <svg viewBox="0 0 9 6" aria-hidden="true">
          <rect width="9" height="6" fill="#aa151b" />
          <rect y="1.5" width="9" height="3" fill="#f1bf00" />
        </svg>
      }
      @case ('ja') {
        <svg viewBox="0 0 9 6" aria-hidden="true">
          <rect width="9" height="6" fill="#fff" />
          <circle cx="4.5" cy="3" r="1.8" fill="#bc002d" />
        </svg>
      }
      @case ('ko') {
        <svg viewBox="0 0 36 24" aria-hidden="true">
          <rect width="36" height="24" fill="#fff" />
          <circle cx="18" cy="12" r="5" fill="#cd2e3a" />
          <path d="M13 12a2.5 2.5 0 0 1 5 0 2.5 2.5 0 0 0 5 0 5 5 0 0 1-10 0" fill="#0047a0" />
          <g fill="#000" transform="rotate(-56.3 18 12)">
            <rect x="6.4" y="10.6" width="4" height="0.8" />
            <rect x="6.4" y="11.6" width="4" height="0.8" />
            <rect x="6.4" y="12.6" width="4" height="0.8" />
            <rect x="25.6" y="10.6" width="4" height="0.8" />
            <rect x="25.6" y="11.6" width="4" height="0.8" />
            <rect x="25.6" y="12.6" width="4" height="0.8" />
          </g>
        </svg>
      }
      @default {
        <!-- English. A Union Jack without the counterchanged diagonals: the
             offset is invisible at 20px wide, and the alternative is a dozen
             clip paths nobody can see. -->
        <svg viewBox="0 0 60 30" aria-hidden="true">
          <rect width="60" height="30" fill="#012169" />
          <path d="M0 0 60 30M60 0 0 30" stroke="#fff" stroke-width="6" />
          <path d="M0 0 60 30M60 0 0 30" stroke="#c8102e" stroke-width="3" />
          <path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10" />
          <path d="M30 0v30M0 15h60" stroke="#c8102e" stroke-width="6" />
        </svg>
      }
    }
  `,
})
export class Flag {
  readonly lang = input.required<Lang>();
}
