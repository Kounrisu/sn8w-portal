import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import type { ProductStatus } from '../../core/models';

@Component({
  selector: 'sn8w-status-badge',
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadge {
  readonly status = input.required<ProductStatus>();
  protected readonly i18n = inject(I18nService);
}
