import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { I18nService } from '../../core/i18n/i18n.service';

interface Principle {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
}

@Component({
  selector: 'sn8w-engineering-principles',
  imports: [MatIconModule],
  templateUrl: './engineering-principles.html',
  styleUrl: './engineering-principles.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EngineeringPrinciples {
  protected readonly i18n = inject(I18nService);

  protected readonly principles = computed<readonly Principle[]>(() => {
    const items = this.i18n.dict().principlesSection.items;
    return [
      { icon: 'accessibility_new', ...items.accessibility },
      { icon: 'architecture', ...items.architecture },
      { icon: 'devices', ...items.responsive },
      { icon: 'speed', ...items.performance },
      { icon: 'widgets', ...items.designSystems },
      { icon: 'fact_check', ...items.testing },
      { icon: 'draw', ...items.ux },
    ];
  });
}
