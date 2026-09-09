import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { StatusBadge } from '../status-badge/status-badge';
import { ProjectAvailability } from '../project-availability/project-availability';
import { RepoLink } from '../repo-link/repo-link';
import { ProjectsService } from '../../core/projects.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { StackRevealDirective } from '../../core/stack-reveal.directive';

/**
 * The `lab` tier, `labSection` i18n copy, and `tierLab` admin label already
 * existed — this was the missing piece that actually renders them. Ideas
 * here don't need a screenshot or a live URL to earn a place; the section
 * hides itself entirely rather than show an empty "Just for fun" heading
 * when nothing has been added yet.
 */
@Component({
  selector: 'sn8w-lab-projects',
  imports: [StatusBadge, ProjectAvailability, RepoLink],
  hostDirectives: [StackRevealDirective],
  templateUrl: './lab-projects.html',
  styleUrl: './lab-projects.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabProjects {
  protected readonly i18n = inject(I18nService);
  protected readonly projects = inject(ProjectsService);
}
