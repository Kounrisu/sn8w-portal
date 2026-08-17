import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { I18nService } from '../../core/i18n/i18n.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'sn8w-site-footer',
  imports: [RouterLink, MatIconModule],
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooter {
  protected readonly i18n = inject(I18nService);
  protected readonly auth = inject(AuthService);
  protected readonly email = 'kounrisu@gmail.com';

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
