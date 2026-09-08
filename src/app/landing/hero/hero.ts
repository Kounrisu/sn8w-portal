import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  effect,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { HeroAudioService } from '../../core/hero-audio.service';

@Component({
  selector: 'sn8w-hero',
  imports: [RouterLink],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero implements AfterViewInit {
  protected readonly i18n = inject(I18nService);
  protected readonly videoFailed = signal(false);

  private readonly audio = inject(HeroAudioService);

  @ViewChild('videoEl') private readonly videoEl?: ElementRef<HTMLVideoElement>;

  constructor() {
    // The sound control lives in the nav; this is the other half of it.
    effect(() => {
      const muted = this.audio.muted();
      const video = this.videoEl?.nativeElement;
      if (!video) return;

      video.muted = muted;
      // Unmuting happens on a click in the nav, so user activation is still
      // live here — the moment a browser that refused the initial autoplay
      // will finally allow playback. Start it rather than leaving a silent
      // frozen frame.
      if (!muted) this.tryPlay(video);
    });
  }

  ngAfterViewInit(): void {
    // Belt-and-suspenders for autoplay: the `muted`/`autoplay` attributes
    // are usually enough, but a couple of browsers only honor autoplay
    // once `.muted` is set as a DOM property (not just an attribute) and
    // `.play()` is called explicitly — harmless no-op where the attributes
    // already worked.
    const video = this.videoEl?.nativeElement;
    if (!video) return;
    video.muted = true;
    this.audio.available.set(true);

    this.tryPlay(video);

    // A `play()` issued before the source has finished resource selection
    // rejects with AbortError ("interrupted by a new load request"), which
    // is not a failure of the video — just bad timing. Retrying once the
    // element actually has data covers that, and covers a browser that
    // refuses autoplay until the media is ready.
    video.addEventListener('canplay', () => this.tryPlay(video), { once: true });

    // Last resort: a browser that refuses muted autoplay outright will
    // allow it off the first real user gesture. Until then the element
    // stays in the DOM showing its first frame — far better than dropping
    // the backdrop the whole page is designed around.
    const onGesture = () => this.tryPlay(video);
    window.addEventListener('pointerdown', onGesture, { once: true, passive: true });
    window.addEventListener('keydown', onGesture, { once: true });
  }

  /**
   * Deliberately swallows rejections instead of treating them as a failed
   * video: only a real media `error` event (a missing or undecodable file)
   * takes the element out of the DOM. A rejected `play()` means "not
   * playing yet", not "no video".
   */
  private tryPlay(video: HTMLVideoElement): void {
    if (!video.paused) return;
    // play() returns a Promise in every real browser, but not in jsdom
    // (used by the test suite) — guard rather than assume.
    const playResult = video.play();
    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(() => undefined);
    }
  }

  protected onVideoError(): void {
    this.videoFailed.set(true);
    // Nothing left to unmute — take the nav's control away with it.
    this.audio.available.set(false);
  }
}
