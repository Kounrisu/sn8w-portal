import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Icon } from '../../shared/icon/icon';
import type { IconName } from '../../shared/icon/icons.generated';
import { I18nService } from '../../core/i18n/i18n.service';
import { StackRevealDirective } from '../../core/stack-reveal.directive';
import { SpotlightDirective } from '../../shared/spotlight.directive';

interface Principle {
  readonly icon: IconName;
  readonly title: string;
  readonly description: string;
}

@Component({
  selector: 'sn8w-engineering-principles',
  imports: [Icon, SpotlightDirective],
  hostDirectives: [StackRevealDirective],
  templateUrl: './engineering-principles.html',
  styleUrl: './engineering-principles.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EngineeringPrinciples {
  protected readonly i18n = inject(I18nService);

  protected readonly principles = computed<readonly Principle[]>(() => {
    const items = this.i18n.dict().principlesSection.items;
    return [
      { icon: 'accessibility', ...items.accessibility },
      { icon: 'ruler', ...items.architecture },
      { icon: 'laptop', ...items.responsive },
      { icon: 'lightning', ...items.performance },
      { icon: 'component', ...items.designSystems },
      { icon: 'clipboard-check', ...items.testing },
      { icon: 'pencil', ...items.ux },
    ];
  });
}
