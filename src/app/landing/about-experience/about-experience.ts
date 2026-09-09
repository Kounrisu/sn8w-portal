import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { StackRevealDirective } from '../../core/stack-reveal.directive';
import { SpotlightDirective } from '../../shared/spotlight.directive';

@Component({
  selector: 'sn8w-about-experience',
  imports: [SpotlightDirective],
  hostDirectives: [StackRevealDirective],
  templateUrl: './about-experience.html',
  styleUrl: './about-experience.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutExperience {
  protected readonly i18n = inject(I18nService);

  /**
   * The "outside the code" rows, flattened for the template. Kept as named
   * keys in the dictionary rather than an array so a missing translation is
   * a compile error, and turned into a list here so the order lives in one
   * place instead of being repeated six times in the markup.
   */
  protected readonly interests = computed(() => {
    const groups = this.i18n.dict().aboutSection.interestsGroups;
    return [
      groups.languages,
      groups.sport,
      groups.sea,
      groups.music,
      groups.watching,
      groups.history,
      groups.garage,
    ];
  });
}
