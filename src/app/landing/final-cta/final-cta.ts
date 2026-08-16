import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
  selector: 'sn8w-final-cta',
  imports: [RouterLink],
  templateUrl: './final-cta.html',
  styleUrl: './final-cta.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinalCta {
  protected readonly i18n = inject(I18nService);
}
