import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { I18nService } from '../../core/i18n/i18n.service';
import { AuthService } from '../../core/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'sn8w-site-footer',
  imports: [RouterLink, MatIconModule, MatTooltipModule],
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooter {
  protected readonly i18n = inject(I18nService);
  protected readonly auth = inject(AuthService);
  protected readonly email = 'kounrisu@gmail.com';

  protected readonly version = environment.version;
  protected readonly build = environment.build;
  protected readonly commit = environment.commit;
  protected readonly commitMessage = environment.commitMessage;

  protected readonly deployedAtLabel = computed(() => {
    const iso = environment.deployedAt;
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return iso;
    return new Intl.DateTimeFormat(this.i18n.lang(), {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(parsed);
  });

  // Public profiles. Each link renders only when its URL is filled in, so a
  // profile that doesn't exist yet simply doesn't appear rather than
  // shipping a dead link. Brand names are not translated, so the labels are
  // in the template rather than the dictionary.
  protected readonly linkedInUrl = 'https://www.linkedin.com/in/sn8w22/';
  protected readonly frontendMastersUrl = 'https://master.dev/u/sn8w/';

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
