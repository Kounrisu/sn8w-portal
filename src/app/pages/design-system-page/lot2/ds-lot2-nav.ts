import { ChangeDetectionStrategy, Component, Injector, afterNextRender, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { DesignSystemCopy } from '../../../core/i18n/design-system-copy';

/**
 * Lot 2 — navigation and page layout: link, skip links, header, main
 * navigation, side menu, summary, dropdown menu, footer. Header and footer
 * are specimens (their links are plain text) so the page does not carry a
 * second banner or contentinfo landmark; navigation examples are real,
 * labelled <nav>s.
 */
@Component({
  selector: 'sn8w-ds-lot2-nav',
  imports: [RouterLink],
  templateUrl: './ds-lot2-nav.html',
  styleUrl: './ds-lot2-nav.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsLot2Nav {
  readonly copy = input.required<DesignSystemCopy>();
  private readonly injector = inject(Injector);

  protected readonly ddOpen = signal(false);
  protected readonly ddChosen = signal(-1);

  /** Download demo: a small real text file, built from the copy at click time. */
  protected downloadHref(content: string): string {
    return 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
  }

  protected readonly mainNavRoutes = [
    { path: ['/'], fragment: 'expertise' },
    { path: ['/'], fragment: 'studio' },
    { path: ['/projects'], fragment: undefined },
    { path: ['/workshop'], fragment: undefined },
  ] as const;

  protected readonly sidePages = [
    { path: ['/design-system'], key: 'intro' },
    { path: ['/design-system', 'foundations'], key: 'foundations' },
    { path: ['/design-system', 'components'], key: 'components' },
    { path: ['/design-system', 'patterns'], key: 'patterns' },
    { path: ['/design-system', 'accessibility'], key: 'accessibility' },
    { path: ['/design-system', 'governance'], key: 'governance' },
  ] as const;

  protected readonly summaryTargets = ['ds-lot2-forms', 'ds-lot2-nav', 'ds-lot2-content'] as const;
  protected readonly skipTargets = ['ds-lot2-forms', 'ds-lot2-nav', 'ds-lot2-content'] as const;

  protected toggleDd(): void {
    this.ddOpen.set(!this.ddOpen());
    if (this.ddOpen()) this.focusItemAfterRender(0);
  }

  private focusItem(index: number): void {
    document.getElementById(`ds-dd-item-${index}`)?.focus();
  }

  /** The menu is `hidden` until Angular renders: wait for that render before moving focus into it. */
  private focusItemAfterRender(index: number): void {
    afterNextRender(() => this.focusItem(index), { injector: this.injector });
  }

  private closeDd(returnFocus: boolean): void {
    this.ddOpen.set(false);
    if (returnFocus) queueMicrotask(() => document.getElementById('ds-dd-trigger')?.focus());
  }

  /** WAI-ARIA menu button: ArrowDown opens, arrows/Home/End move, Escape closes and returns focus. */
  protected onTriggerKey(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.ddOpen.set(true);
      this.focusItemAfterRender(0);
    } else if (event.key === 'Escape' && this.ddOpen()) {
      event.preventDefault();
      this.closeDd(true);
    }
  }

  protected onMenuKey(event: KeyboardEvent, index: number, count: number): void {
    const next: Record<string, number> = {
      ArrowDown: (index + 1) % count,
      ArrowUp: (index - 1 + count) % count,
      Home: 0,
      End: count - 1,
    };
    if (event.key in next) {
      event.preventDefault();
      this.focusItem(next[event.key]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.closeDd(true);
    } else if (event.key === 'Tab') {
      this.closeDd(false);
    }
  }

  protected choose(index: number): void {
    this.ddChosen.set(index);
    this.closeDd(true);
  }
}
