import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import type { FlagshipMockup, Project, ProjectInput, ProductStatus, ProductTier } from './models';

export interface ProjectGroup {
  readonly title: string;
  readonly projects: readonly Project[];
}

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/projects.php`;

  private readonly all = signal<Project[]>([]);
  readonly loaded = signal(false);
  readonly loadError = signal(false);

  readonly flagship = computed(() =>
    this.all()
      .filter((p) => p.tier === 'flagship')
      .sort((a, b) => a.sortOrder - b.sortOrder),
  );

  readonly ecosystemGroups = computed<ProjectGroup[]>(() => {
    const groups = new Map<string, Project[]>();
    for (const project of this.all()) {
      if (project.tier !== 'ecosystem') continue;
      const title = project.groupTitle ?? 'Other';
      if (!groups.has(title)) groups.set(title, []);
      groups.get(title)!.push(project);
    }
    return [...groups.entries()]
      .map(([title, projects]) => ({
        title,
        projects: projects.sort((a, b) => a.sortOrder - b.sortOrder),
      }))
      .sort((a, b) => a.title.localeCompare(b.title));
  });

  readonly lab = computed(() =>
    this.all()
      .filter((p) => p.tier === 'lab')
      .sort((a, b) => a.sortOrder - b.sortOrder),
  );

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    try {
      const projects = await firstValueFrom(this.http.get<Project[]>(this.baseUrl));
      this.all.set(projects);
      this.loadError.set(false);
    } catch {
      this.loadError.set(true);
    } finally {
      this.loaded.set(true);
    }
  }

  /** All projects, for the admin table. */
  list(): readonly Project[] {
    return this.all();
  }

  async create(input: ProjectInput): Promise<Project> {
    const created = await firstValueFrom(this.http.post<Project>(this.baseUrl, input));
    this.all.update((projects) => [...projects, created]);
    return created;
  }

  async update(id: number, input: Partial<ProjectInput>): Promise<Project> {
    const updated = await firstValueFrom(
      this.http.put<Project>(this.baseUrl, input, { params: { id } }),
    );
    this.all.update((projects) => projects.map((p) => (p.id === id ? updated : p)));
    return updated;
  }

  async remove(id: number): Promise<void> {
    await firstValueFrom(this.http.delete(this.baseUrl, { params: { id } }));
    this.all.update((projects) => projects.filter((p) => p.id !== id));
  }
}

export const PRODUCT_STATUSES: readonly ProductStatus[] = [
  'live',
  'in-development',
  'concept',
  'prototype',
];
export const PRODUCT_TIERS: readonly ProductTier[] = ['flagship', 'ecosystem', 'lab'];
export const FLAGSHIP_MOCKUPS: readonly FlagshipMockup[] = ['inspector', 'dashboard', 'creative'];
