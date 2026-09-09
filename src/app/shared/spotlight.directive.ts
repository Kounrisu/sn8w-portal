import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';

/**
 * Cursor-following spotlight highlight (see `panel.spotlight` in
 * `_panel.scss`) for buttons and cards. Pure DOM: writes --spot-x/--spot-y
 * inline and toggles `.is-spotlit` directly on the host element, so it
 * needs no Angular change detection and is safe under zoneless.
 *
 * Disabled entirely on touch devices (no meaningful cursor to track) and
 * under prefers-reduced-motion.
 */
@Directive({
  selector: '.btn, [sn8wSpotlight]',
})
export class SpotlightDirective {
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;

  private readonly onMove = (event: PointerEvent): void => {
    const rect = this.el.getBoundingClientRect();
    this.el.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
    this.el.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
  };

  private readonly onEnter = (): void => {
    this.el.classList.add('is-spotlit');
  };

  private readonly onLeave = (): void => {
    this.el.classList.remove('is-spotlit');
  };

  constructor() {
    // matchMedia is absent in the unit-test DOM environment (no real
    // display to query) — treat that the same as "no usable pointer".
    if (typeof matchMedia !== 'function') return;

    const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canHover || reducedMotion) return;

    this.el.addEventListener('pointermove', this.onMove);
    this.el.addEventListener('pointerenter', this.onEnter);
    this.el.addEventListener('pointerleave', this.onLeave);

    inject(DestroyRef).onDestroy(() => {
      this.el.removeEventListener('pointermove', this.onMove);
      this.el.removeEventListener('pointerenter', this.onEnter);
      this.el.removeEventListener('pointerleave', this.onLeave);
    });
  }
}
