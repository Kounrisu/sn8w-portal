import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { SpotlightDirective } from '../../shared/spotlight.directive';

/**
 * Placeholder for now — will host accessible components under test and
 * running notes as they're built out. Not linked from the top nav yet:
 * that nav mixes in-page anchors (Products/About/Contact) with real
 * routes, which is exactly the confusion a fourth top-level link would
 * make worse before that's redesigned.
 */
@Component({
  selector: 'sn8w-workshop-page',
  imports: [RouterLink, SpotlightDirective],
  templateUrl: './workshop-page.html',
  styleUrl: './workshop-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkshopPage {
  protected readonly i18n = inject(I18nService);
}
