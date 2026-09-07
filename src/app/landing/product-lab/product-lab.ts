import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ProjectAvailability } from '../project-availability/project-availability';
import { ProjectsService } from '../../core/projects.service';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
  selector: 'sn8w-product-lab',
  imports: [ProjectAvailability],
  templateUrl: './product-lab.html',
  styleUrl: './product-lab.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductLab {
  protected readonly i18n = inject(I18nService);
  protected readonly projects = inject(ProjectsService);
}
