import { Directive, ElementRef, Injector, afterNextRender, effect, inject } from '@angular/core';
import { I18nService } from '../core/i18n/i18n.service';

/**
 * RGAA 6.2 / WCAG understanding — a link that opens a new tab must warn
 * the visitor before they activate it, not after. Matches every
 * `target="_blank"` anchor already in the app (external links, in
 * practice, since that's the only reason this site opens a new tab) and
 * appends a screen-reader-only suffix to its accessible name, kept in
 * sync with the current language. The visible "↗" cue for sighted users
 * lives in styles.scss as a plain `::after` — decorative only, since
 * generated CSS content isn't a reliable way to expose text to assistive
 * tech, so the real announcement has to be this real DOM node instead.
 */
@Directive({
  selector: 'a[target=_blank]',
})
export class ExternalLinkDirective {
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;
  private readonly i18n = inject(I18nService);
  private readonly injector = inject(Injector);

  constructor() {
    if (typeof document === 'undefined') return;

    // Directive constructors run before Angular creates the host element's
    // own text children — appending here would land this span BEFORE the
    // link's visible text instead of after it. afterNextRender defers past
    // that first render, once the real content already exists.
    afterNextRender(
      () => {
        const hint = document.createElement('span');
        hint.className = 'visually-hidden';
        this.el.appendChild(hint);

        effect(
          () => {
            hint.textContent = ` (${this.i18n.dict().common.opensInNewTab})`;
          },
          { injector: this.injector },
        );
      },
      { injector: this.injector },
    );
  }
}
