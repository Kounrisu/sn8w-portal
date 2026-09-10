import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { SpotlightDirective } from '../../shared/spotlight.directive';

@Component({
  selector: 'sn8w-login-page',
  imports: [FormsModule, SpotlightDirective],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  protected readonly i18n = inject(I18nService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly username = signal('');
  protected readonly password = signal('');
  protected readonly submitting = signal(false);
  protected readonly error = signal(false);

  protected async submit(): Promise<void> {
    if (this.submitting()) return;

    this.error.set(false);
    this.submitting.set(true);

    try {
      await this.auth.login(this.username(), this.password());
      // '/' (stay where you already were), not '/admin' — signing in isn't
      // itself a request to go manage the site. authGuard sets a real
      // returnUrl when you were actually redirected here from a protected
      // page, which still takes you back there as before.
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
      await this.router.navigateByUrl(returnUrl);
    } catch {
      this.error.set(true);
    } finally {
      this.submitting.set(false);
    }
  }
}
