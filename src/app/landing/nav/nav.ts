import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, Injector, afterNextRender, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { Flag } from '../flag/flag';
import { SpotlightDirective } from '../../shared/spotlight.directive';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { ThemeService, type Theme } from '../../core/theme.service';
import { PreferencesService } from '../../core/preferences.service';
import type { Lang } from '../../core/i18n/dictionary';

/**
 * The top bar: branding plus one row of icon-only controls (routes,
 * language/theme/accessibility/session) at every width — no hamburger
 * fallback, so there's nothing hidden behind a menu on mobile. In-page
 * anchors (Products/About/Contact) live in `SideToc` instead, not here —
 * see that component for why they're kept apart from real routes.
 */
@Component({
  selector: 'sn8w-nav',
  imports: [RouterLink, RouterLinkActive, MatIconModule, MatMenuModule, MatTooltipModule, Flag, SpotlightDirective],
  templateUrl: './nav.html',
  styleUrl: './nav.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Nav {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly i18n = inject(I18nService);
  protected readonly auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);
  protected readonly prefs = inject(PreferencesService);
  private readonly router = inject(Router);

  protected readonly themeLabel = computed(() => {
    const dict = this.i18n.dict().common;
    return { frost: dict.themeFrost, squirrel: dict.themeSquirrel } as const;
  });

  /**
   * The theme the toggle switches to — 'frost' is the dark one. Both the
   * icon and the label describe this, not the current theme: a toggle that
   * shows where you are gives you no way to know where the click leads.
   */
  protected readonly nextTheme = computed<'frost' | 'squirrel'>(() =>
    this.theme.theme() === 'frost' ? 'squirrel' : 'frost',
  );

  protected readonly scrolled = signal(false);

  /**
   * So "Sign in" returns here instead of always landing on /admin —
   * clicking it isn't a request to go manage the site, just to
   * authenticate wherever you already are. Kept as a signal (not read
   * directly off `router.url` in the template) so it actually updates on
   * navigation under OnPush; a plain getter read once wouldn't.
   */
  protected readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  constructor() {
    void this.auth.ensureChecked();

    const onScroll = () => this.scrolled.set(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    this.destroyRef.onDestroy(() => window.removeEventListener('scroll', onScroll));

    this.publishNavHeight();
  }

  /**
   * Publishes the nav bar's measured height as `--nav-h` on <html>, so the
   * hero can pin *below* the nav (`top: var(--nav-h)`) and fill exactly the
   * space left under it, and so fragment links scroll their target clear of
   * it. Measured rather than hard-coded because the bar's height moves with
   * the fluid type scale and the translated label lengths.
   */
  private publishNavHeight(): void {
    if (typeof ResizeObserver === 'undefined') return;

    // `afterNextRender`, not the constructor body: the template hasn't been
    // rendered yet at construction, so .nav__inner doesn't exist to measure.
    afterNextRender(
      () => {
        const bar = this.host.nativeElement.querySelector('.nav__inner');
        if (!bar) return;

        const observer = new ResizeObserver(([entry]) => {
          const height = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
          document.documentElement.style.setProperty('--nav-h', `${Math.round(height)}px`);
        });
        observer.observe(bar);
        this.destroyRef.onDestroy(() => observer.disconnect());
      },
      { injector: this.injector },
    );
  }

  protected setLang(lang: Lang): void {
    this.i18n.setLang(lang);
  }

  protected setTheme(theme: Theme): void {
    this.theme.setTheme(theme);
  }

  protected async logout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/');
  }
}
