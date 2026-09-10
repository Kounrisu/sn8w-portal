import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  effect,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { filter } from 'rxjs';
import { Nav } from './landing/nav/nav';
import { SiteFooter } from './landing/site-footer/site-footer';
import { ThemeService } from './core/theme.service';
import { AnalyticsService } from './core/analytics.service';
import { createParticles, drawFrame, type Particle, type StarfieldMode } from './starfield';

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

  private readonly prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  private animationFrame = 0;
  private particles: Particle[] = [];
  private mode: StarfieldMode = 'frost';
  private resizeObserver?: ResizeObserver;
  private canvas?: HTMLCanvasElement;
  private ctx?: CanvasRenderingContext2D;
  private dpr = 1;

  constructor() {
    effect(() => {
      this.mode = this.themeService.theme();
      this.regenerate();
    });

    const router = inject(Router);
    this.analytics.trackPageview(router.url);
    router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => this.analytics.trackPageview(event.urlAfterRedirects));

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
    this.particles = createParticles(this.canvas.clientWidth, this.canvas.clientHeight, this.mode);
    if (this.prefersReducedMotion) {
      drawFrame(this.ctx, this.particles, this.dpr, 0, this.mode);
    }
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationFrame);
    this.resizeObserver?.disconnect();
  }
}
