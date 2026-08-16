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
import { RouterOutlet } from '@angular/router';
import { Nav } from './landing/nav/nav';
import { SiteFooter } from './landing/site-footer/site-footer';
import { ThemeService } from './core/theme.service';
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
