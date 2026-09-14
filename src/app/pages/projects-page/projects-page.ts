import { afterNextRender, ChangeDetectionStrategy, Component, computed, ElementRef, inject, Injector, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { ProjectsService } from '../../core/projects.service';
import { CATALOG_COPY, PROJECT_BATCH_SIZE, PROJECT_THEMES, projectTheme } from '../../core/project-catalog';
import type { ProjectTheme } from '../../core/models';
import { ProjectCard } from '../../landing/project-card/project-card';
import { ProjectCount } from '../../landing/project-count/project-count';

@Component({
  selector: 'sn8w-projects-page',
  imports: [RouterLink, ProjectCard, ProjectCount],
  templateUrl: './projects-page.html',
  styleUrl: './projects-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsPage {
  protected readonly i18n = inject(I18nService);
  protected readonly projects = inject(ProjectsService);
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly injector = inject(Injector);
  protected readonly copy = computed(() => CATALOG_COPY[this.i18n.lang()]);
  protected readonly themes = PROJECT_THEMES;
  protected readonly selected = signal<ProjectTheme | 'all'>('all');
  protected readonly limit = signal(PROJECT_BATCH_SIZE);
  protected readonly filtered = computed(() => this.projects.visible().filter(p => this.selected() === 'all' || projectTheme(p) === this.selected()));
  protected readonly shown = computed(() => this.filtered().slice(0, this.limit()));
  protected select(theme: ProjectTheme | 'all'): void {
    this.selected.set(theme);
    this.limit.set(PROJECT_BATCH_SIZE);
  }
  protected count(theme: ProjectTheme): number {
    return this.projects.visible().filter(p => projectTheme(p) === theme).length;
  }
  protected showMore(): void {
    const firstNew = this.shown().length;
    this.limit.update(value => value + PROJECT_BATCH_SIZE);
    afterNextRender(() => {
      this.host.nativeElement.querySelectorAll<HTMLElement>('[data-project-heading]')[firstNew]?.focus();
    }, { injector: this.injector });
  }
}
