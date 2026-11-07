import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { I18nService } from '../../core/i18n/i18n.service';
import { ProjectsService } from '../../core/projects.service';
import {
  CATALOG_COPY,
  PROJECT_THEMES,
  projectTheme,
} from '../../core/project-catalog';
import type { ProjectTheme } from '../../core/models';
import { ProjectCard } from '../../landing/project-card/project-card';
import { ProjectCount } from '../../landing/project-count/project-count';

@Component({
  selector: 'sn8w-projects-page',
  imports: [RouterLink, FormsModule, ProjectCard, ProjectCount],
  templateUrl: './projects-page.html',
  styleUrl: './projects-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsPage {
  protected readonly i18n = inject(I18nService);
  protected readonly projects = inject(ProjectsService);
  protected readonly copy = computed(() => CATALOG_COPY[this.i18n.lang()]);
  protected readonly themes = computed(() =>
    PROJECT_THEMES.filter((theme) => this.count(theme) > 0),
  );
  protected readonly selected = signal<ProjectTheme | 'all'>('all');
  protected readonly activeTheme = computed(() =>
    this.themes().includes(this.selected() as ProjectTheme) ? this.selected() : 'all',
  );
  protected readonly query = signal('');
  protected readonly hasFilters = computed(
    () => this.query().length > 0 || this.activeTheme() !== 'all',
  );
  protected readonly filtered = computed(() => {
    const terms = normalizeSearch(this.query()).split(/\s+/).filter(Boolean);
    return this.projects.visible().filter((p) => {
      if (this.activeTheme() !== 'all' && projectTheme(p) !== this.activeTheme()) return false;
      const text = normalizeSearch(`${p.name} ${p.category} ${p.tagline}`);
      return terms.every((term) => text.includes(term));
    });
  });
  /** The whole catalogue: the page scrolls, and the search / domain filter narrow it down. */
  protected readonly shown = this.filtered;
  protected select(theme: ProjectTheme | 'all'): void {
    this.selected.set(theme);
  }
  protected search(value: string): void {
    this.query.set(value);
  }
  protected clear(searchInput: HTMLInputElement): void {
    this.query.set('');
    this.select('all');
    searchInput.focus();
  }
  protected count(theme: ProjectTheme): number {
    return this.projects.visible().filter((p) => projectTheme(p) === theme).length;
  }
}

function normalizeSearch(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
}
