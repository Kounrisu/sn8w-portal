import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { AnalyticsService } from '../../core/analytics.service';
import type { Project } from '../../core/models';

const GITHUB_PROFILE_URL = 'https://github.com/Kounrisu';
const REPO_ACCESS_EMAIL = 'kounrisu@gmail.com';

@Component({
  selector: 'sn8w-repo-link',
  templateUrl: './repo-link.html',
  styleUrl: './repo-link.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RepoLink {
  readonly project = input.required<Project>();

  protected readonly i18n = inject(I18nService);
  private readonly analytics = inject(AnalyticsService);
  protected readonly profileUrl = GITHUB_PROFILE_URL;

  protected trackRepoClick(): void {
    this.analytics.trackEvent('project-repo', this.project().name);
  }

  protected readonly mailtoHref = computed(() => {
    const project = this.project();
    const dict = this.i18n.dict().projectCard;
    const subject = dict.repoAccessSubject.replace('{name}', project.name);
    const body = dict.repoAccessBody.replace('{name}', project.name);
    const params = new URLSearchParams({ subject, body });
    return `mailto:${REPO_ACCESS_EMAIL}?${params.toString().replace(/\+/g, '%20')}`;
  });
}
