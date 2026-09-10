import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { ProjectsService } from '../../core/projects.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { AnalyticsService } from '../../core/analytics.service';
import type { Project } from '../../core/models';
import { ExternalLinkDirective } from '../../shared/external-link.directive';

@Component({
  selector: 'sn8w-project-availability',
  imports: [ExternalLinkDirective],
  templateUrl: './project-availability.html',
  styleUrl: './project-availability.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectAvailability {
  readonly project = input.required<Project>();

  protected readonly i18n = inject(I18nService);
  private readonly projects = inject(ProjectsService);
  private readonly analytics = inject(AnalyticsService);

  protected readonly requesting = signal(false);

  /** The URL without scheme/trailing slash, for display as the link's own text. */
  protected readonly displayUrl = computed(() => {
    const url = this.project().url;
    if (!url) return '';
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  });

  protected trackVisit(): void {
    this.analytics.trackEvent('project-visit', this.project().name);
  }

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
