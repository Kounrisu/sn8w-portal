import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  FLAGSHIP_MOCKUPS,
  PRODUCT_STATUSES,
  PRODUCT_TIERS,
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

  protected readonly tiers = PRODUCT_TIERS;
  protected readonly statuses = PRODUCT_STATUSES;
  protected readonly mockups = FLAGSHIP_MOCKUPS;

  protected readonly formOpen = signal(false);
  protected readonly editingId = signal<number | null>(null);
  protected readonly form = signal<ProjectInput>({ ...EMPTY_FORM });
  protected readonly saving = signal(false);

  protected tierLabel(tier: ProductTier): string {
    const dict = this.i18n.dict().admin;
    return tier === 'flagship' ? dict.tierFlagship : tier === 'ecosystem' ? dict.tierEcosystem : dict.tierLab;
  }

  protected openCreate(): void {
    this.editingId.set(null);
    this.form.set({ ...EMPTY_FORM });
    this.formOpen.set(true);
  }

  protected openEdit(project: Project): void {
    this.editingId.set(project.id);
    this.form.set({
      tier: project.tier,
      groupTitle: project.groupTitle ?? '',
      mockup: project.mockup,
      name: project.name,
      category: project.category,
      tagline: project.tagline,
      status: project.status,
      url: project.url ?? '',
      sortOrder: project.sortOrder,
    });
    this.formOpen.set(true);
  }

  protected closeForm(): void {
    this.formOpen.set(false);
    this.editingId.set(null);
  }

  protected updateField<K extends keyof ProjectInput>(key: K, value: ProjectInput[K]): void {
    this.form.update((f) => ({ ...f, [key]: value }));
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
      };

      const editing = this.editingId();
      if (editing !== null) {
        await this.projects.update(editing, input);
      } else {
        await this.projects.create(input);
      }
      this.closeForm();
    } finally {
      this.saving.set(false);
    }
  }

  protected async remove(project: Project): Promise<void> {
    if (!confirm(this.i18n.dict().admin.confirmDelete)) return;
    await this.projects.remove(project.id);
  }
}
