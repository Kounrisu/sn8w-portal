import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, effect, ElementRef, inject, input, signal, untracked } from '@angular/core';
import { PreferencesService } from '../../core/preferences.service';

@Component({
  selector: 'sn8w-project-count',
  template: `
    <p class="count">
      <span aria-hidden="true"><strong>{{ displayed() }}</strong><span class="divider"> / </span>{{ total() }} <span class="label">{{ label() }}</span></span>
      <span class="sr-only" role="status" aria-live="polite" aria-atomic="true">{{ count() }} / {{ total() }} {{ label() }}</span>
    </p>
  `,
  styles: `
    :host { display: block; }
    .count { margin: 1.5rem 0; color: var(--mist); font-family: var(--font-mono); font-variant-numeric: tabular-nums; }
    strong { color: var(--ink); font-size: var(--text-xl); font-weight: 600; }
    .divider { margin-inline: .25rem; }
    .label { font-family: var(--font-sans); font-size: var(--text-sm); }
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectCount {
  readonly count = input.required<number>();
  readonly total = input.required<number>();
  readonly label = input.required<string>();
  readonly displayed = signal(0);
  private readonly preferences = inject(PreferencesService);
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly destroy = inject(DestroyRef);
  private readonly inView = signal(false);
  private readonly systemReduced = signal(true);

  constructor() {
    afterNextRender(() => {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      const update = () => this.systemReduced.set(media.matches);
      update();
      media.addEventListener('change', update);
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          this.inView.set(true);
          observer.disconnect();
        }
      });
      observer.observe(this.host.nativeElement);
      this.destroy.onDestroy(() => {
        observer.disconnect();
        media.removeEventListener('change', update);
      });
    });
    effect(onCleanup => {
      const target = this.count();
      const reduced = this.preferences.motion() === 'reduced' || this.systemReduced();
      if (!this.inView() || reduced) {
        this.displayed.set(target);
        return;
      }
      const from = untracked(this.displayed);
      // Start the first reveal at zero, then count from the previous batch.
      const startValue = from === target ? 0 : from;
      const start = performance.now();
      let frame = 0;
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / 550);
        this.displayed.set(Math.round(startValue + (target - startValue) * (1 - (1 - progress) ** 3)));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      onCleanup(() => cancelAnimationFrame(frame));
    });
  }
}
