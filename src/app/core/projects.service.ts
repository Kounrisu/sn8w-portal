import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { I18nService } from './i18n/i18n.service';
import type { Lang } from './i18n/dictionary';
import type {
  FlagshipMockup,
  Project,
  ProjectAvailability,
  ProjectInput,
  ProductStatus,
  ProductTier,
} from './models';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private readonly http = inject(HttpClient);
  private readonly i18n = inject(I18nService);
  private readonly baseUrl = `${environment.apiBaseUrl}/projects.php`;

  /** English/base content — what admin edits, never affected by the UI language. */
  private readonly all = signal<Project[]>([]);
  readonly loaded = signal(false);
  readonly loadError = signal(false);

  /**
   * The same projects, in whatever language the UI is currently in — the
   * public landing page reads from here, admin never does. Kept as a
   * separate signal (not derived from `all`) specifically so that switching
   * the site language can't accidentally feed translated text back into the
   * admin form and have it saved over the English original.
   */
  private readonly localized = signal<Project[]>([]);

  readonly flagship = computed(() =>
    this.localized()
      .filter((p) => p.tier === 'flagship')
      .sort((a, b) => a.sortOrder - b.sortOrder),
  );

  readonly lab = computed(() =>
    this.localized()
      .filter((p) => p.tier === 'lab')
      .sort((a, b) => a.sortOrder - b.sortOrder),
  );

  /**
   * Ecosystem and lab projects that are still just an idea — merged into
   * one section rather than two, and filtered to `concept` status only.
   * Anything further along (prototype, in-development, live) either has a
   * more prominent spot already or isn't ready to show yet; flip its
   * status forward in admin once it earns a place here.
   */
  readonly explorations = computed(() =>
    this.localized()
      .filter((p) => (p.tier === 'ecosystem' || p.tier === 'lab') && p.status === 'concept')
      .sort((a, b) => a.sortOrder - b.sortOrder),
  );

  constructor() {
    void this.load();

    // Re-fetch the localized copy whenever the UI language changes —
    // English never hits the network twice (?lang= is omitted for it,
    // matching the base fetch above).
    effect(() => {
      void this.loadLocalized(this.i18n.lang());
    });
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

  private async loadLocalized(lang: Lang): Promise<void> {
    try {
      const params: Record<string, string> = lang === 'en' ? {} : { lang };
      const projects = await firstValueFrom(this.http.get<Project[]>(this.baseUrl, { params }));
      this.localized.set(projects);
    } catch {
      // Leave the previous localized list in place on a transient failure —
      // better a stale-but-correct list than an empty landing page.
    }
  }

  /** All projects in English, for the admin table. */
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

  /**
   * Persists a new admin-table row order — mirrors TodosService.reorderBoard.
   * Callers are expected to only reorder within one tier/group at a time
   * (see AdminPage's sortPredicate); reindexing the whole list 0..n-1
   * regardless is harmless since the API always sorts by tier/group first.
   */
  async reorderList(newOrder: readonly Project[]): Promise<void> {
    const withOrders = newOrder.map((p, index) => ({ ...p, sortOrder: index }));
    this.all.set(withOrders);
    await Promise.all(
      newOrder.map((project, index) =>
        project.sortOrder === index
          ? Promise.resolve()
          : firstValueFrom(
              this.http.put<Project>(this.baseUrl, { sortOrder: index }, { params: { id: project.id } }),
            ),
      ),
    );
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
