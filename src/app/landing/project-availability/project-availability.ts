import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { ProjectsService } from '../../core/projects.service';
import { I18nService } from '../../core/i18n/i18n.service';
import type { Project } from '../../core/models';

@Component({
  selector: 'sn8w-project-availability',
  templateUrl: './project-availability.html',
  styleUrl: './project-availability.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectAvailability {
  readonly project = input.required<Project>();

  protected readonly i18n = inject(I18nService);
  private readonly projects = inject(ProjectsService);

  protected readonly requesting = signal(false);

  protected async request(): Promise<void> {
    const project = this.project();
    if (this.requesting() || project.activationRequestedAt) return;

    this.requesting.set(true);
    try {
      await this.projects.requestActivation(project.id);
    } finally {
      this.requesting.set(false);
    }
  }
}
