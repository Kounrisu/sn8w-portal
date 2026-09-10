import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SpotlightDirective } from '../../shared/spotlight.directive';

/**
 * RGAA accessibility statement — kept in French regardless of the site's
 * current UI language, same as every other French RGAA declaration:
 * it's a legal document tied to French regulation (Article 47, loi
 * n° 2005-102), not site chrome, so it isn't run through the i18n
 * dictionary like the rest of the app.
 */
@Component({
  selector: 'sn8w-accessibility-page',
  imports: [RouterLink, SpotlightDirective],
  templateUrl: './accessibility-page.html',
  styleUrl: './accessibility-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessibilityPage {
  protected readonly auditDate = '10 septembre 2026';
  protected readonly contactEmail = 'kounrisu@gmail.com';
}
