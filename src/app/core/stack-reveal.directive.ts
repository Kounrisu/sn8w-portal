import { Directive, ElementRef, Renderer2, DestroyRef, afterNextRender, inject } from '@angular/core';

/**
 * Applied (via `hostDirectives`) to each full-viewport landing section.
 *
 * Adds two classes to the host:
 *  - `reveal-ready`, immediately, meaning "JS is in charge of revealing
 *    this section". The stylesheets only hide a section's cards under this
 *    class, so if the directive never runs the content simply shows —
 *    a failed reveal must never leave the page blank.
 *  - `is-active`, once the section has scrolled far enough into view to be
 *    the block on screen, which is what actually transitions the cards in.
 */
@Directive({
  selector: '[snStackReveal]',
  standalone: true,
})
export class StackRevealDirective {
  /** Fraction of the viewport a section's top must cross to count as arrived. */
  private static readonly REVEAL_AT = 0.85;

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const host = this.el.nativeElement;

      const arrived = () =>
        host.getBoundingClientRect().top < window.innerHeight * StackRevealDirective.REVEAL_AT;

      // Already on screen at load (the first section below the hero, or any
      // section on a short page): reveal it outright. Adding `reveal-ready`
      // here would hide content that is being looked at right now, betting
      // on a later event to bring it back.
      if (arrived()) {
        this.renderer.addClass(host, 'is-active');
        return;
      }

      this.renderer.addClass(host, 'reveal-ready');

      let frame = 0;
      let poll = 0;

      const finish = () => {
        // Revealed on the way in and left revealed: re-hiding a section as
        // it scrolls off the top would flash it back down to 0.97 scale
        // just as the next one arrives.
        this.renderer.addClass(host, 'is-active');
        stop();
      };

      const check = () => {
        frame = 0;
        if (arrived()) finish();
      };

      // Coalesces a burst of scroll events into one measurement per frame —
      // `getBoundingClientRect()` forces layout, so calling it per event is
      // what makes this kind of listener janky.
      const onScroll = () => {
        if (!frame) frame = requestAnimationFrame(check);
      };

      const stop = () => {
        if (frame) cancelAnimationFrame(frame);
        if (poll) clearInterval(poll);
        frame = 0;
        poll = 0;
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });

      // Backstop, and the reason this doesn't rely on the listener alone:
      // anything that moves a section into view without a scroll event —
      // programmatic scrolling in some embedded browsers, an anchor jump, a
      // layout shift as fonts or images land — would otherwise leave the
      // section hidden for good. Polling is cheap here (one rect per
      // section, ~7 times a second) and each one stops as soon as it fires.
      poll = window.setInterval(check, 150);

      this.destroyRef.onDestroy(stop);
    });
  }
}
