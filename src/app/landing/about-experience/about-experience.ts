import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { StackRevealDirective } from '../../core/stack-reveal.directive';

@Component({
  selector: 'sn8w-about-experience',
  imports: [],
  hostDirectives: [StackRevealDirective],
  templateUrl: './about-experience.html',
  styleUrl: './about-experience.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutExperience {
  protected readonly i18n = inject(I18nService);
}
