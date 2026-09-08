import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { I18nService } from '../../core/i18n/i18n.service';
import { environment } from '../../../environments/environment';
import { PROFILES } from '../../core/profiles';

@Component({
  selector: 'sn8w-site-footer',
  imports: [RouterLink, MatIconModule, MatTooltipModule],
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooter {
  protected readonly i18n = inject(I18nService);
  protected readonly email = 'kounrisu@gmail.com';

  // Still referenced by the version badge's tooltip.
  protected readonly commit = environment.commit;
  protected readonly commitMessage = environment.commitMessage;

  /**
   * `v0.1.0 · build 25 · a1b2c3d · 8 Sept 2026, 22:48` on a deployed build.
   *
   * The commit and timestamp are dropped when they aren't real values: they
   * are the literal string 'dev' in a local build, and would be the
   * unsubstituted '__COMMIT_SHA__' placeholders if the deploy workflow ever
   * failed to fill them in. Better a short line than `dev · dev`.
   */
  protected readonly buildLabel = computed(() => {
    const dict = this.i18n.dict().footer;
    const real = (value: string) => value && value !== 'dev' && !value.startsWith('__');

    const parts = [`v${environment.version}`, `build ${environment.build}`];
    if (real(environment.commit)) parts.push(environment.commit);

    const iso = environment.deployedAt;
    const parsed = new Date(iso);
    if (real(iso) && !Number.isNaN(parsed.getTime())) {
      // Labelled, not a bare date: an unlabelled timestamp in a footer could
      // be anything — a copyright year, a last-edited date. This one is the
      // moment the deploy ran, in the reader's own timezone (the workflow
      // stamps it in UTC).
      const when = new Intl.DateTimeFormat(this.i18n.lang(), {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(parsed);
      parts.push(`${dict.deployedAt} ${when}`);
    } else {
      // A local build has no deploy behind it. Say that, rather than leaving
      // a gap that reads like the timestamp failed to render.
      parts.push(dict.localBuild);
    }
    return parts.join(' · ');
  });

  protected readonly profiles = PROFILES;

  private readonly clipboard = inject(Clipboard);
  private readonly liveAnnouncer = inject(LiveAnnouncer);
  private readonly snackBar = inject(MatSnackBar);

  protected copyEmail(): void {
    const copied = this.clipboard.copy(this.email);
    const dict = this.i18n.dict().footer;
    const message = copied ? dict.copied : dict.copyFailed;

    this.snackBar.open(message, undefined, {
      duration: 2500,
      panelClass: 'sn8w-snackbar',
    });
    this.liveAnnouncer.announce(message, 'polite');
  }
}
