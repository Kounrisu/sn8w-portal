import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ViewportScroller } from '@angular/common';
import { filter } from 'rxjs';
import { Nav } from './landing/nav/nav';
import { SiteFooter } from './landing/site-footer/site-footer';
import { ThemeService } from './core/theme.service';
import { PreferencesService } from './core/preferences.service';
import { AnalyticsService } from './core/analytics.service';
import { I18nService } from './core/i18n/i18n.service';
import type { Dict } from './core/i18n/dictionary';
import { createParticles, drawFrame, type Particle, type StarfieldMode } from './starfield';

// The tab title otherwise never changes between routes in this SPA — a
// direct RGAA/WCAG 2.4.2 (Page Titled) miss, since a screen reader or a
// bookmark/history entry has no way to tell pages apart. Undefined
// (the '' home route) keeps BASE_TITLE as-is; every other route resolves
// its own label from the already-translated dictionary, so it follows the
// current language automatically.
type TitleKey =
  | 'home'
  | 'behindTheScenes'
  | 'login'
  | 'admin'
  | 'todo'
  | 'diary'
  | 'analytics'
  | 'sitemap'
  | 'workshop'
  | 'preferences'
  | 'accessibilityStatement';

const BASE_TITLE = 'Philippe Parmentier — Front-End Angular Developer';

// The RGAA declaration page is deliberately French-only (see its own
// component) regardless of site language, so its title is too.
const TITLE_RESOLVERS: Record<TitleKey, (dict: Dict) => string> = {
  home: (d) => d.sitemap.home,
  behindTheScenes: (d) => d.behindTheScenes.navLabel,
  login: (d) => d.auth.title,
  admin: (d) => d.nav.admin,
  todo: (d) => d.nav.todo,
  diary: (d) => d.nav.diary,
  analytics: (d) => d.nav.analytics,
  sitemap: (d) => d.sitemap.title,
  workshop: (d) => d.workshop.navLabel,
  preferences: (d) => d.preferences.navLabel,
  accessibilityStatement: () => "Déclaration d'accessibilité",
};

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Nav, SiteFooter],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements AfterViewInit, OnDestroy {
  @ViewChild('starfield') private readonly starfieldRef?: ElementRef<HTMLCanvasElement>;

  private readonly themeService = inject(ThemeService);
  private readonly analytics = inject(AnalyticsService);
  // Root-provided but otherwise only injected by the settings page itself —
  // without a reference here, Angular never instantiates it (and its
  // constructor effect() never runs) unless you actually visit that page,
  // so every preference silently stops applying anywhere else on the site.
  private readonly preferences = inject(PreferencesService);
  private readonly titleService = inject(Title);
  private readonly i18n = inject(I18nService);

  private readonly currentTitleKey = signal<TitleKey | undefined>(undefined);
  // Announced through a visually-hidden aria-live region on every in-app
  // navigation — an SPA's route changes are otherwise silent to screen
  // reader users, who get no equivalent of a real page load's announcement.
  protected readonly routeAnnouncement = signal('');

  private readonly prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  private animationFrame = 0;
  private particles: Particle[] = [];
  private mode: StarfieldMode = 'frost';
  // The high-contrast theme is an accessibility accommodation, not a visual
  // identity — it drops the decorative starfield entirely rather than
  // picking a mode for it, to keep the background maximally quiet.
  private starfieldEnabled = true;
  private resizeObserver?: ResizeObserver;
  private canvas?: HTMLCanvasElement;
  private ctx?: CanvasRenderingContext2D;
  private dpr = 1;

  constructor() {
    effect(() => {
      const theme = this.themeService.theme();
      this.starfieldEnabled = theme !== 'contrast';
      this.mode = theme === 'squirrel' ? 'squirrel' : 'frost';
      this.regenerate();
    });

    // Recomputes whenever the route changes OR the language changes, so a
    // language switch immediately retranslates the current page's title too.
    effect(() => {
      const dict = this.i18n.dict();
      const key = this.currentTitleKey();
      const label = key ? TITLE_RESOLVERS[key](dict) : undefined;
      this.titleService.setTitle(label && key !== 'home' ? `${label} — Sn8w` : BASE_TITLE);
      if (label) this.routeAnnouncement.set(label);
    });

    const router = inject(Router);
    this.analytics.trackPageview(router.url);
    this.currentTitleKey.set(router.routerState.snapshot.root.firstChild?.data['titleKey']);
    let isFirstNavigation = true;
    router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        this.analytics.trackPageview(event.urlAfterRedirects);
        this.currentTitleKey.set(router.routerState.snapshot.root.firstChild?.data['titleKey']);

        // A real page load already puts focus at the top and announces
        // itself; only virtual (in-app) navigations need this simulated —
        // doing it on the very first load would steal focus from whatever
        // the user actually arrived on (e.g. a deep link's #fragment).
        if (!isFirstNavigation) {
          document.getElementById('main')?.focus({ preventScroll: true });
        }
        isFirstNavigation = false;
      });

    // Router's built-in anchorScrolling (withInMemoryScrolling) computes the
    // target's position via getBoundingClientRect() and does a plain
    // window.scrollTo() — it never consults CSS scroll-padding-top, which
    // only affects native scrollIntoView()/anchor scrolling. This is
    // Angular's actual mechanism for compensating a fixed header: a function
    // (not a static tuple) so it re-reads the nav bar's real current height
    // on every scroll, not whatever it measured once at startup.
    const viewportScroller = inject(ViewportScroller);
    viewportScroller.setOffset(() => {
      const bar = document.querySelector('.nav__inner');
      const height = bar?.getBoundingClientRect().height ?? 0;
      return [0, height + 16];
    });
  }

  ngAfterViewInit(): void {
    const canvas = this.starfieldRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.canvas = canvas;
    this.ctx = ctx;
    this.dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width = canvas.clientWidth * this.dpr;
      canvas.height = canvas.clientHeight * this.dpr;
      this.regenerate();
    };

    resize();
    this.resizeObserver = new ResizeObserver(resize);
    this.resizeObserver.observe(canvas);

    if (!this.prefersReducedMotion) {
      const tick = (time: number) => {
        if (this.ctx) drawFrame(this.ctx, this.particles, this.dpr, time, this.mode);
        this.animationFrame = requestAnimationFrame(tick);
      };
      this.animationFrame = requestAnimationFrame(tick);
    }
  }

  private regenerate(): void {
    if (!this.canvas || !this.ctx) return;
    this.particles = this.starfieldEnabled
      ? createParticles(this.canvas.clientWidth, this.canvas.clientHeight, this.mode)
      : [];
    if (this.prefersReducedMotion || !this.starfieldEnabled) {
      drawFrame(this.ctx, this.particles, this.dpr, 0, this.mode);
    }
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationFrame);
    this.resizeObserver?.disconnect();
  }
}
