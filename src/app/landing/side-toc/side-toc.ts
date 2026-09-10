import { ChangeDetectionStrategy, Component, DestroyRef, Injector, afterNextRender, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';

interface TocLink {
  readonly fragment: string;
  readonly label: string;
}

/**
 * A floating "where am I" indicator for this page's own sections
 * (Products/About/Contact) — deliberately not part of `Nav`. Those are
 * anchors within the one page, not destinations the way /workshop or
 * /admin are; mixing the two in one bar was the actual complaint this
 * replaces (see nav.ts's doc comment). Small enough (a dot rail) to float
 * at every width, including mobile — not gated behind a breakpoint.
 */
@Component({
  selector: 'sn8w-side-toc',
  imports: [RouterLink],
  templateUrl: './side-toc.html',
  styleUrl: './side-toc.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideToc {
  private readonly i18n = inject(I18nService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly links = computed<readonly TocLink[]>(() => {
    const dict = this.i18n.dict().nav;
    return [
      { fragment: 'products', label: dict.products },
      { fragment: 'studio', label: dict.about },
      { fragment: 'contact', label: dict.contact },
    ];
  });

  protected readonly active = signal<string | null>(null);
  private observer: IntersectionObserver | null = null;

  constructor() {
    this.observeSections();
  }

  private observeSections(): void {
    if (typeof IntersectionObserver === 'undefined') return;

    // afterNextRender: the target sections live in sibling components
    // rendered alongside this one, not guaranteed to exist in the DOM yet
    // at construction time.
    afterNextRender(
      () => {
        const targets = this.links()
          .map((link) => document.getElementById(link.fragment))
          .filter((el): el is HTMLElement => el !== null);
        if (targets.length === 0) return;

        // A band across the middle third of the viewport: with tall
        // sections, using the full viewport as the intersection root would
        // mark two adjacent sections "in view" at once for most of the
        // scroll, with no clear signal of which one is actually active.
        this.observer = new IntersectionObserver(
          (entries) => {
            const visible = entries.filter((entry) => entry.isIntersecting);
            if (visible.length === 0) return;
            const top = visible.reduce((a, b) => (b.intersectionRatio > a.intersectionRatio ? b : a));
            this.active.set(top.target.id);
          },
          { rootMargin: '-40% 0px -40% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
        );
        for (const target of targets) {
          this.observer.observe(target);
        }
      },
      { injector: this.injector },
    );
    this.destroyRef.onDestroy(() => this.observer?.disconnect());
  }
}
