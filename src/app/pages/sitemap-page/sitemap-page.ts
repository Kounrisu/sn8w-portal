import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { AuthService } from '../../core/auth.service';
import { SpotlightDirective } from '../../shared/spotlight.directive';
import { CATALOG_COPY } from '../../core/project-catalog';

@Component({
  selector: 'sn8w-sitemap-page',
  imports: [RouterLink, SpotlightDirective],
  templateUrl: './sitemap-page.html',
  styleUrl: './sitemap-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SitemapPage {
  protected readonly i18n = inject(I18nService);
  protected readonly auth = inject(AuthService);
  protected catalogCopy() { return CATALOG_COPY[this.i18n.lang()]; }

  constructor() {
    void this.auth.ensureChecked();
  }
}
