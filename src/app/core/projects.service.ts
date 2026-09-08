import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import type {
  FlagshipMockup,
  Project,
  ProjectAvailability,
  ProjectInput,
  ProductStatus,
  ProductTier,
} from './models';

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

  /**
   * Every ecosystem project in one flat, ordered list. The section used to
   * split these by category, which said more about the taxonomy than about
   * the work — they now read as one shelf of small tools.
   */
  readonly ecosystem = computed(() =>
    this.all()
      .filter((p) => p.tier === 'ecosystem')
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

  /** Clears a pending activation request without changing availability. */
  async dismissActivationRequest(id: number): Promise<Project> {
    const updated = await firstValueFrom(
      this.http.put<Project>(
        this.baseUrl,
        { activationRequestedAt: null },
        { params: { id } },
      ),
    );
    this.all.update((projects) => projects.map((p) => (p.id === id ? updated : p)));
    return updated;
  }

  /** Public, unauthenticated — any visitor can ask for an inactive project to be spun back up. */
  async requestActivation(id: number): Promise<Project> {
    const updated = await firstValueFrom(
      this.http.post<Project>(`${environment.apiBaseUrl}/project-activate.php`, { id }),
    );
    this.all.update((projects) => projects.map((p) => (p.id === id ? updated : p)));
    return updated;
  }

  async uploadScreenshot(id: number, file: File): Promise<Project> {
    const form = new FormData();
    form.append('file', file);
    const updated = await firstValueFrom(
      this.http.post<Project>(`${environment.apiBaseUrl}/project-screenshot.php`, form, {
        params: { id },
      }),
    );
    this.all.update((projects) => projects.map((p) => (p.id === id ? updated : p)));
    return updated;
  }

  async removeScreenshot(id: number): Promise<Project> {
    const updated = await firstValueFrom(
      this.http.delete<Project>(`${environment.apiBaseUrl}/project-screenshot.php`, {
        params: { id },
      }),
    );
    this.all.update((projects) => projects.map((p) => (p.id === id ? updated : p)));
    return updated;
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
export const PROJECT_AVAILABILITIES: readonly ProjectAvailability[] = ['active', 'inactive'];
