import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { Project } from '../../core/models';
import { StatusBadge } from '../status-badge/status-badge';
import { ProjectAvailability } from '../project-availability/project-availability';
import { RepoLink } from '../repo-link/repo-link';
import { ProjectGallery } from '../project-gallery/project-gallery';
import { StackRevealDirective } from '../../core/stack-reveal.directive';

@Component({
  selector: 'sn8w-project-card',
  imports: [StatusBadge, ProjectAvailability, RepoLink, ProjectGallery, StackRevealDirective],
  template: `
    <article class="flagship" snStackReveal [attr.aria-labelledby]="'project-heading-' + project().id">
      <div class="flagship__copy">
        <span class="flagship__index" aria-hidden="true">{{ (index() + 1).toString().padStart(2, '0') }}</span>
        <p class="flagship__category">{{ project().category }}</p>
        @if (headingLevel() === 2) {
          <h2 class="flagship__name" data-project-heading tabindex="-1" [id]="'project-heading-' + project().id">{{ project().name }}</h2>
        } @else {
          <h3 class="flagship__name" data-project-heading tabindex="-1" [id]="'project-heading-' + project().id">{{ project().name }}</h3>
        }
        <p class="flagship__tagline">{{ project().tagline }}</p>
        <div class="flagship__meta">
          <sn8w-status-badge [status]="project().status" />
          <sn8w-project-availability [project]="project()" />
          <sn8w-repo-link [project]="project()" />
        </div>
      </div>
      @if (project().screenshot || project().screenshots?.length) {
        <sn8w-project-gallery class="flagship__visual" [project]="project()" />
      }
    </article>
  `,
  styleUrl: './project-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectCard {
  readonly project = input.required<Project>();
  readonly index = input(0);
  readonly headingLevel = input<2 | 3>(3);
}
