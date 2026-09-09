import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { StatusBadge } from '../status-badge/status-badge';
import { ProjectAvailability } from '../project-availability/project-availability';
import { RepoLink } from '../repo-link/repo-link';
import { ProjectsService } from '../../core/projects.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { StackRevealDirective } from '../../core/stack-reveal.directive';

/**
 * One section for anything still just an idea — merges what used to be two
 * separate "ecosystem" and "lab" sections, filtered to `concept` status via
 * `ProjectsService.explorations()`. Ideas here don't need a screenshot or a
 * live URL to earn a place; the section hides itself entirely rather than
 * show an empty heading when nothing qualifies.
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
