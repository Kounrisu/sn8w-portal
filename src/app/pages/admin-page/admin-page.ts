import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  FLAGSHIP_MOCKUPS,
  PRODUCT_STATUSES,
  PRODUCT_TIERS,
  PROJECT_AVAILABILITIES,
  ProjectsService,
} from '../../core/projects.service';
import { I18nService } from '../../core/i18n/i18n.service';
import type { FlagshipMockup, Project, ProjectInput, ProductTier } from '../../core/models';

const EMPTY_FORM: ProjectInput = {
  tier: 'ecosystem',
  groupTitle: '',
  mockup: null,
  name: '',
  category: '',
  tagline: '',
  status: 'concept',
  url: '',
  repoUrl: '',
  repoPrivate: false,
  availability: 'active',
  sortOrder: 0,
};

@Component({
  selector: 'sn8w-admin-page',
  imports: [FormsModule],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPage {
  protected readonly i18n = inject(I18nService);
  protected readonly projects = inject(ProjectsService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly tiers = PRODUCT_TIERS;
  protected readonly statuses = PRODUCT_STATUSES;
  protected readonly mockups = FLAGSHIP_MOCKUPS;
  protected readonly availabilities = PROJECT_AVAILABILITIES;

  protected readonly formOpen = signal(false);
  protected readonly editingId = signal<number | null>(null);
  protected readonly editingProject = signal<Project | null>(null);
  protected readonly form = signal<ProjectInput>({ ...EMPTY_FORM });
  protected readonly saving = signal(false);
  protected readonly uploadingScreenshot = signal(false);

  protected displayUrl(url: string): string {
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }

  /**
   * Downloads the current project list (name, category, tagline — the
   * fields that actually get translated) as JSON, for handing to Claude
   * when asking for a translation pass. Not the full row: screenshots,
   * repo links etc. aren't relevant to that task.
   */
  protected exportForTranslation(): void {
    const rows = this.projects.list().map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      tagline: p.tagline,
    }));
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sn8w-projects-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  protected tierLabel(tier: ProductTier): string {
    const dict = this.i18n.dict().admin;
    return tier === 'flagship' ? dict.tierFlagship : tier === 'ecosystem' ? dict.tierEcosystem : dict.tierLab;
  }

  protected openCreate(): void {
    this.editingId.set(null);
    this.editingProject.set(null);
    this.form.set({ ...EMPTY_FORM });
    this.formOpen.set(true);
  }

  protected openEdit(project: Project): void {
    this.editingId.set(project.id);
    this.editingProject.set(project);
    this.form.set({
      tier: project.tier,
      groupTitle: project.groupTitle ?? '',
      mockup: project.mockup,
      name: project.name,
      category: project.category,
      tagline: project.tagline,
      status: project.status,
      url: project.url ?? '',
      repoUrl: project.repoUrl ?? '',
      repoPrivate: project.repoPrivate,
      availability: project.availability,
      sortOrder: project.sortOrder,
    });
    this.formOpen.set(true);
  }

  protected closeForm(): void {
    this.formOpen.set(false);
    this.editingId.set(null);
    this.editingProject.set(null);
  }

  protected updateField<K extends keyof ProjectInput>(key: K, value: ProjectInput[K]): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  private notify(message: string): void {
    this.snackBar.open(message, undefined, { duration: 2500, panelClass: 'sn8w-snackbar' });
  }

  protected async submit(): Promise<void> {
    if (this.saving()) return;
    this.saving.set(true);

    try {
      const value = this.form();
      const input: ProjectInput = {
        ...value,
        groupTitle: value.tier === 'ecosystem' ? value.groupTitle || null : null,
        mockup: value.tier === 'flagship' ? (value.mockup as FlagshipMockup | null) : null,
        url: value.url || null,
        repoUrl: value.repoUrl || null,
      };

      const editing = this.editingId();
      if (editing !== null) {
        const updated = await this.projects.update(editing, input);
        this.editingProject.set(updated);
        this.notify(this.i18n.dict().admin.saved);
      } else {
        // Stay in the form after create so a screenshot can be attached
        // right away — uploads need a project id to attach to.
        const created = await this.projects.create(input);
        this.editingId.set(created.id);
        this.editingProject.set(created);
        this.notify(this.i18n.dict().admin.created);
      }
    } finally {
      this.saving.set(false);
    }
  }

  protected async remove(project: Project): Promise<void> {
    if (!confirm(this.i18n.dict().admin.confirmDelete)) return;
    await this.projects.remove(project.id);
    this.notify(this.i18n.dict().admin.deleted);
  }

  protected async onScreenshotSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const id = this.editingId();
    if (!file || id === null) return;

    this.uploadingScreenshot.set(true);
    try {
      const updated = await this.projects.uploadScreenshot(id, file);
      this.editingProject.set(updated);
      this.notify(this.i18n.dict().admin.saved);
    } finally {
      this.uploadingScreenshot.set(false);
      input.value = '';
    }
  }

  protected async removeScreenshot(): Promise<void> {
    const id = this.editingId();
    if (id === null) return;
    const updated = await this.projects.removeScreenshot(id);
    this.editingProject.set(updated);
    this.notify(this.i18n.dict().admin.saved);
  }

  protected async markActive(): Promise<void> {
    const id = this.editingId();
    if (id === null) return;
    const updated = await this.projects.update(id, { availability: 'active' });
    this.editingProject.set(updated);
    this.updateField('availability', 'active');
    this.notify(this.i18n.dict().admin.saved);
  }

  protected async dismissActivationRequest(): Promise<void> {
    const id = this.editingId();
    if (id === null) return;
    const updated = await this.projects.dismissActivationRequest(id);
    this.editingProject.set(updated);
    this.notify(this.i18n.dict().admin.saved);
  }
}
