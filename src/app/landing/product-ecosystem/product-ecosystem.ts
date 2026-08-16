import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { StatusBadge } from '../status-badge/status-badge';
import { ProjectsService } from '../../core/projects.service';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
  selector: 'sn8w-product-ecosystem',
  imports: [StatusBadge],
  templateUrl: './product-ecosystem.html',
  styleUrl: './product-ecosystem.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductEcosystem {
  protected readonly i18n = inject(I18nService);
  protected readonly projects = inject(ProjectsService);
}
