import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { StatusBadge } from '../status-badge/status-badge';
import { ProjectAvailability } from '../project-availability/project-availability';
import { RepoLink } from '../repo-link/repo-link';
import { ProjectsService } from '../../core/projects.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { StackRevealDirective } from '../../core/stack-reveal.directive';

@Component({
  selector: 'sn8w-product-ecosystem',
  imports: [StatusBadge, ProjectAvailability, RepoLink],
  hostDirectives: [StackRevealDirective],
  templateUrl: './product-ecosystem.html',
  styleUrl: './product-ecosystem.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductEcosystem {
  protected readonly i18n = inject(I18nService);
  protected readonly projects = inject(ProjectsService);
}
