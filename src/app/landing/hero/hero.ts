import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
  selector: 'sn8w-hero',
  imports: [RouterLink, MatIconModule],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero implements AfterViewInit {
  protected readonly i18n = inject(I18nService);
  protected readonly videoFailed = signal(false);

  /**
   * The video starts muted because every browser refuses to autoplay audio
   * without a user gesture — unmuted autoplay would simply not play at all.
   * The control below lets the visitor turn sound on; it deliberately does
   * not persist across loads, so nobody lands on the page and is
   * unexpectedly played audio.
   */
  protected readonly muted = signal(true);

  @ViewChild('videoEl') private readonly videoEl?: ElementRef<HTMLVideoElement>;

  ngAfterViewInit(): void {
    // Belt-and-suspenders for autoplay: the `muted`/`autoplay` attributes
    // are usually enough, but a couple of browsers only honor autoplay
    // once `.muted` is set as a DOM property (not just an attribute) and
    // `.play()` is called explicitly — harmless no-op where the attributes
    // already worked.
    const video = this.videoEl?.nativeElement;
    if (!video) return;
    video.muted = true;

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

  protected toggleMute(): void {
    const video = this.videoEl?.nativeElement;
    if (!video) return;

    const nextMuted = !this.muted();
    video.muted = nextMuted;
    this.muted.set(nextMuted);

    // Unmuting is itself a user gesture, so this is also the moment a
    // browser that refused the initial autoplay will finally allow
    // playback — start it rather than leaving a silent frozen frame.
    if (!nextMuted) this.tryPlay(video);
  }

  protected onVideoError(): void {
    this.videoFailed.set(true);
  }
}
