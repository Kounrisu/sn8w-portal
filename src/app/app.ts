import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Nav } from './landing/nav/nav';
import { SiteFooter } from './landing/site-footer/site-footer';
import { createParticles, drawFrame, type Particle } from './starfield';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Nav, SiteFooter],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements AfterViewInit, OnDestroy {
  @ViewChild('starfield') private readonly starfieldRef?: ElementRef<HTMLCanvasElement>;

  private readonly prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  private animationFrame = 0;
  private particles: Particle[] = [];
  private resizeObserver?: ResizeObserver;

  ngAfterViewInit(): void {
    const canvas = this.starfieldRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      this.particles = createParticles(canvas.clientWidth, canvas.clientHeight);
      if (this.prefersReducedMotion) {
        drawFrame(ctx, this.particles, dpr, 0);
      }
    };

    resize();
    this.resizeObserver = new ResizeObserver(resize);
    this.resizeObserver.observe(canvas);

    if (!this.prefersReducedMotion) {
      const tick = (time: number) => {
        drawFrame(ctx, this.particles, dpr, time);
        this.animationFrame = requestAnimationFrame(tick);
      };
      this.animationFrame = requestAnimationFrame(tick);
    }
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationFrame);
    this.resizeObserver?.disconnect();
  }
}
