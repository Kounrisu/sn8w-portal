import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Public audit results. The French content declares its language in the template. */
@Component({
  selector: 'sn8w-accessibility-page',
  imports: [RouterLink],
  templateUrl: './accessibility-page.html',
  styleUrl: './accessibility-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessibilityPage {
  protected readonly auditDate = '14 septembre 2026';
  protected readonly contactEmail = 'kounrisu@gmail.com';
}
