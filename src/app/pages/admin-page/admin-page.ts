import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule, moveItemInArray, type CdkDrag, type CdkDragDrop } from '@angular/cdk/drag-drop';
import {
  FLAGSHIP_MOCKUPS,
  PRODUCT_STATUSES,
  PRODUCT_TIERS,
  PROJECT_AVAILABILITIES,
  ProjectsService,
} from '../../core/projects.service';
import { I18nService } from '../../core/i18n/i18n.service';
import type { FlagshipMockup, Project, ProjectInput, ProductStatus, ProductTier } from '../../core/models';
import { SpotlightDirective } from '../../shared/spotlight.directive';
import { ExternalLinkDirective } from '../../shared/external-link.directive';

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
  imports: [FormsModule, MatIconModule, DragDropModule, SpotlightDirective, ExternalLinkDirective],
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
    switch (tier) {
      case 'flagship':
        return dict.tierFlagship;
      case 'ecosystem':
        return dict.tierEcosystem;
      case 'lab':
        return dict.tierLab;
    }
  }

  /**
   * Row order only means anything within the same tier (and, for
   * ecosystem, the same group) — the API always sorts by tier/group first,
   * so a project dragged or bumped past that boundary would just snap back
   * to it on the next load. Both the drag sortPredicate and the up/down
   * buttons gate on this.
   */
  private groupKey(project: Project): string {
    return `${project.tier}:${project.groupTitle ?? ''}`;
  }

  protected canMoveUp(project: Project): boolean {
    const list = this.projects.list();
    const index = list.findIndex((p) => p.id === project.id);
    return index > 0 && this.groupKey(list[index - 1]) === this.groupKey(project);
  }

  protected canMoveDown(project: Project): boolean {
    const list = this.projects.list();
    const index = list.findIndex((p) => p.id === project.id);
    return index !== -1 && index < list.length - 1 && this.groupKey(list[index + 1]) === this.groupKey(project);
  }

  protected async moveUp(project: Project): Promise<void> {
    if (!this.canMoveUp(project)) return;
    const list = [...this.projects.list()];
    const index = list.findIndex((p) => p.id === project.id);
    moveItemInArray(list, index, index - 1);
    await this.projects.reorderList(list);
  }

  protected async moveDown(project: Project): Promise<void> {
    if (!this.canMoveDown(project)) return;
    const list = [...this.projects.list()];
    const index = list.findIndex((p) => p.id === project.id);
    moveItemInArray(list, index, index + 1);
    await this.projects.reorderList(list);
  }

  protected readonly sortPredicate = (index: number, drag: CdkDrag<Project>): boolean => {
    const target = this.projects.list()[index];
    return target !== undefined && this.groupKey(target) === this.groupKey(drag.data);
  };

  protected async drop(event: CdkDragDrop<readonly Project[]>): Promise<void> {
    if (event.previousIndex === event.currentIndex) return;
    const list = [...this.projects.list()];
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    await this.projects.reorderList(list);
  }

  /**
   * Forces every tier/group's sortOrder back to a clean 0, 1, 2... sequence
   * without moving anything — for groups nobody has dragged since data was
   * seeded (or edited by hand before this reorder logic existed), whose
   * numbers can otherwise sit duplicated or arbitrary indefinitely.
   */
  protected async renumberAll(): Promise<void> {
    await this.projects.reorderList(this.projects.list());
    this.notify(this.i18n.dict().admin.renumbered);
  }

  protected async setTier(project: Project, tier: ProductTier): Promise<void> {
    // Mirrors submit()'s cleanup: a field that no longer applies to the new
    // tier shouldn't linger in the database just because this is the quick
    // inline edit rather than the full form.
    await this.projects.update(project.id, {
      tier,
      groupTitle: tier === 'ecosystem' ? project.groupTitle : null,
      mockup: tier === 'flagship' ? project.mockup : null,
    });
  }

  protected async setStatus(project: Project, status: ProductStatus): Promise<void> {
    await this.projects.update(project.id, { status });
  }

  protected async toggleAvailability(project: Project): Promise<void> {
    const availability = project.availability === 'active' ? 'inactive' : 'active';
    await this.projects.update(project.id, { availability });
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
    } catch {
      this.notify(this.i18n.dict().common.error);
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
