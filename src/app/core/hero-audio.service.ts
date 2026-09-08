import { Injectable, signal } from '@angular/core';

/**
 * Shared state for the hero video's sound, so the control can live in the
 * nav while the `<video>` element it drives lives in the hero.
 *
 * The nav owns the button and flips `muted`; the hero owns the element and
 * reacts to it. `available` lets the nav hide the control entirely when
 * there is no hero video to unmute — on a route without a hero, or when the
 * video failed to load.
 */
@Injectable({ providedIn: 'root' })
export class HeroAudioService {
  /** True once a hero video is on the page and playable. */
  readonly available = signal(false);

  /**
   * Starts muted, and is never persisted: no browser autoplays audio without
   * a user gesture, and nobody should land on the page and be played sound
   * they did not ask for.
   */
  readonly muted = signal(true);

  toggleMuted(): void {
    this.muted.update((muted) => !muted);
  }
}
