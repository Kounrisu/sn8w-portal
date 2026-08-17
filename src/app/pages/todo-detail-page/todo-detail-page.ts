import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TodosService } from '../../core/todos.service';
import { I18nService } from '../../core/i18n/i18n.service';
import type { TodoPriority } from '../../core/models';

@Component({
  selector: 'sn8w-todo-detail-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './todo-detail-page.html',
  styleUrl: './todo-detail-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoDetailPage {
  protected readonly i18n = inject(I18nService);
  private readonly todos = inject(TodosService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly priorities: readonly TodoPriority[] = ['low', 'medium', 'high'];
  protected readonly progressPresets: readonly number[] = [0, 20, 50, 100];

  protected readonly id = signal<number | null>(null);
  protected readonly isNew = signal(true);
  protected readonly loaded = signal(false);
  protected readonly saving = signal(false);

  protected readonly title = signal('');
  protected readonly description = signal('');
  protected readonly priority = signal<TodoPriority>('medium');
  protected readonly progress = signal(0);
  protected readonly titleError = signal(false);

  constructor() {
    const param = this.route.snapshot.paramMap.get('id');
    void this.init(param);
  }

  private async init(param: string | null): Promise<void> {
    if (param === null) {
      this.isNew.set(true);
      this.loaded.set(true);
      return;
    }

    const id = Number(param);
    this.id.set(id);
    this.isNew.set(false);

    const todo = await this.todos.get(id);
    this.title.set(todo.title);
    this.description.set(todo.description ?? '');
    this.priority.set(todo.priority);
    this.progress.set(todo.progress);
    this.loaded.set(true);
  }

  protected priorityLabel(priority: TodoPriority): string {
    return this.i18n.dict().todoPage.priority[priority];
  }

  protected async save(): Promise<void> {
    const title = this.title().trim();
    if (!title) {
      this.titleError.set(true);
      return;
    }
    this.titleError.set(false);
    this.saving.set(true);

    try {
      const input = {
        title,
        description: this.description().trim() || null,
        priority: this.priority(),
        progress: this.progress(),
      };

      if (this.isNew()) {
        await this.todos.create(input);
      } else {
        await this.todos.update(this.id()!, input);
      }
      await this.router.navigateByUrl('/todo');
    } finally {
      this.saving.set(false);
    }
  }

  protected async remove(): Promise<void> {
    const id = this.id();
    if (id === null) return;
    if (!confirm(this.i18n.dict().todoDetailPage.deleteConfirm)) return;
    await this.todos.remove(id);
    await this.router.navigateByUrl('/todo');
  }
}
