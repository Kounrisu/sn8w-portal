import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UpperCasePipe } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatIconModule } from '@angular/material/icon';
import { Flag } from '../flag/flag';
import { SpotlightDirective } from '../../shared/spotlight.directive';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { ThemeService, type Theme } from '../../core/theme.service';
import type { Lang } from '../../core/i18n/dictionary';

interface NavLink {
  readonly fragment: string;
  readonly label: string;
}

@Component({
  selector: 'sn8w-nav',
  imports: [
    RouterLink,
    RouterLinkActive,
    UpperCasePipe,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    Flag,
    SpotlightDirective,
  ],
  templateUrl: './nav.html',
  styleUrl: './nav.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Nav {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly i18n = inject(I18nService);
  protected readonly auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);
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
  protected readonly nextTheme = computed<Theme>(() =>
    this.theme.theme() === 'frost' ? 'squirrel' : 'frost',
  );

  protected readonly links = computed<readonly NavLink[]>(() => {
    const dict = this.i18n.dict();
    return [
      { fragment: 'products', label: dict.nav.products },
      { fragment: 'studio', label: dict.nav.about },
      { fragment: 'contact', label: dict.nav.contact },
    ];
  });

  protected readonly isCompact = toSignal(
    this.breakpointObserver.observe('(max-width: 900px)').pipe(map((state) => state.matches)),
    { initialValue: false },
  );

  protected readonly menuOpen = signal(false);
  protected readonly scrolled = signal(false);

  /**
   * Which in-page section (Projects/About/Contact) is currently in view —
   * routerLinkActive only tracks the URL, and clicking a fragment link
   * doesn't change the URL's path, so it can never reflect "which section
   * am I actually looking at right now" the way it does for a real route
   * like /todo. Driven by IntersectionObserver instead; see observeSections.
   */
  protected readonly activeFragment = signal<string | null>(null);
  private sectionObserver: IntersectionObserver | null = null;

  constructor() {
    void this.auth.ensureChecked();

    const onScroll = () => this.scrolled.set(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    this.destroyRef.onDestroy(() => window.removeEventListener('scroll', onScroll));

    this.publishNavHeight();

    // The sections only exist in the DOM on the home route, and Nav itself
    // is never destroyed between routes — re-run this on every navigation
    // rather than once at startup, so leaving and returning to home (or
    // landing there after a deep link) still finds and observes them.
    this.observeSections();
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.observeSections());
    this.destroyRef.onDestroy(() => this.sectionObserver?.disconnect());
  }

  private observeSections(): void {
    this.sectionObserver?.disconnect();
    this.activeFragment.set(null);
    if (typeof IntersectionObserver === 'undefined') return;

    afterNextRender(
      () => {
        const targets = this.links()
          .map((link) => document.getElementById(link.fragment))
          .filter((el): el is HTMLElement => el !== null);
        if (targets.length === 0) return;

        // A band across the middle third of the viewport, rather than the
        // whole thing: with tall sections, using the full viewport as the
        // intersection root would mark two adjacent sections "in view" at
        // once for most of the scroll, with no clear signal of which one
        // the reader is actually reading.
        this.sectionObserver = new IntersectionObserver(
          (entries) => {
            const visible = entries.filter((entry) => entry.isIntersecting);
            if (visible.length === 0) return;
            const top = visible.reduce((a, b) => (b.intersectionRatio > a.intersectionRatio ? b : a));
            this.activeFragment.set(top.target.id);
          },
          { rootMargin: '-40% 0px -40% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
        );
        for (const target of targets) {
          this.sectionObserver.observe(target);
        }
      },
      { injector: this.injector },
    );
  }

  /**
   * Publishes the nav bar's measured height as `--nav-h` on <html>, so the
   * hero can pin *below* the nav (`top: var(--nav-h)`) and fill exactly the
   * space left under it, and so fragment links scroll their target clear of
   * it. Measured rather than hard-coded because the bar's height moves with
   * the fluid type scale, the compact breakpoint, and the translated label
   * lengths.
   *
   * Deliberately measures `.nav__inner` (the bar itself) and not the host:
   * on mobile the expanded menu is part of the host, and letting that count
   * would resize the hero every time the menu opens.
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

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    if (this.menuOpen()) {
      this.menuOpen.set(false);
    }
  }

  protected onEscape(): void {
    if (this.menuOpen()) {
      this.menuOpen.set(false);
      const toggle = this.host.nativeElement.querySelector('.menu-toggle');
      (toggle as HTMLButtonElement | null)?.focus();
    }
  }

  protected setLang(lang: Lang): void {
    this.i18n.setLang(lang);
  }

  protected setTheme(theme: Theme): void {
    this.theme.setTheme(theme);
  }

  protected async logout(): Promise<void> {
    await this.auth.logout();
    this.closeMenu();
    await this.router.navigateByUrl('/');
  }
}
