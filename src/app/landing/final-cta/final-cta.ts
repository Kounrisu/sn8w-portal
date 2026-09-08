import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { StackRevealDirective } from '../../core/stack-reveal.directive';

@Component({
  selector: 'sn8w-final-cta',
  imports: [RouterLink],
  hostDirectives: [StackRevealDirective],
  templateUrl: './final-cta.html',
  styleUrl: './final-cta.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinalCta {
  protected readonly i18n = inject(I18nService);
}
