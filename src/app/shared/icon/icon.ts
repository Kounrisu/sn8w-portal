import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { ICONS, type IconName } from './icons.generated';

/**
 * An SN8W icon (PORTAL-24): the same inputs as SN8W's `sn-icon` (name, size, title), so moving to
 * the SN8W Angular package later only changes the tag. The drawings come from the SN8W design system
 * through scripts/sync-sn8w-icons.mjs; they fill with the text colour.
 *
 * - Decorative (next to a text that says the same): no title, the SVG is aria-hidden.
 * - Meaningful (the only cue, e.g. an icon-only button without aria-label): give a title.
 *
 * Its size is 1.5rem unless the page's CSS sets width and height on the element, or `size` is given.
 */
@Component({
  selector: 'sn8w-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="sn8w-icon__box" [innerHTML]="svg()"></span>`,
  styles: `
    :host {
      display: inline-flex;
      flex-shrink: 0;
      width: 1.5rem;
      height: 1.5rem;
      vertical-align: middle;
      line-height: 1;
    }
    .sn8w-icon__box,
    .sn8w-icon__box ::ng-deep svg {
      display: block;
      width: 100%;
      height: 100%;
    }
    @media (forced-colors: active) {
      .sn8w-icon__box ::ng-deep svg {
        fill: CanvasText;
      }
    }
  `,
  host: {
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()',
  },
})
export class Icon {
  private readonly sanitizer = inject(DomSanitizer);

  readonly name = input.required<IconName>();
  readonly size = input<number | undefined>(undefined);
  readonly title = input<string | undefined>(undefined);

  protected readonly svg = computed<SafeHtml>(() => {
    const title = this.title();
    const a11y = title ? `role="img"><title>${escapeXml(title)}</title>` : 'aria-hidden="true">';
    const markup =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" focusable="false" ${a11y}` +
      `${ICONS[this.name()]}</svg>`;
    // SAFETY: the shapes come only from icons.generated.ts (SN8W drawings checked by the sync
    // script), and the title is escaped. Never use this for markup from a user or a URL.
    return this.sanitizer.bypassSecurityTrustHtml(markup);
  });
}

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
