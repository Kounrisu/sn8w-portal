import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ProjectAvailability } from '../project-availability/project-availability';
import { RepoLink } from '../repo-link/repo-link';
import { ProjectsService } from '../../core/projects.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { StackRevealDirective } from '../../core/stack-reveal.directive';

@Component({
  selector: 'sn8w-product-lab',
  imports: [ProjectAvailability, RepoLink],
  hostDirectives: [StackRevealDirective],
  templateUrl: './product-lab.html',
  styleUrl: './product-lab.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductLab {
  protected readonly i18n = inject(I18nService);
  protected readonly projects = inject(ProjectsService);
}
