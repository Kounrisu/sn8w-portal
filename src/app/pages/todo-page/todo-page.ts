import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TodosService } from '../../core/todos.service';
import { I18nService } from '../../core/i18n/i18n.service';
import type { Todo, TodoStatus } from '../../core/models';

@Component({
  selector: 'sn8w-todo-page',
  imports: [FormsModule],
  templateUrl: './todo-page.html',
  styleUrl: './todo-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoPage {
  protected readonly i18n = inject(I18nService);
  protected readonly todos = inject(TodosService);

  protected readonly newTitle = signal('');

  protected readonly columns: readonly TodoStatus[] = ['todo', 'in_progress', 'done'];

  protected readonly byStatus = computed(() => {
    const grouped: Record<TodoStatus, Todo[]> = {
      todo: [],
      in_progress: [],
      done: [],
    };
    for (const todo of this.todos.board()) {
      grouped[todo.status].push(todo);
    }
    return grouped;
  });

  constructor() {
    void this.todos.loadBoard();
  }

  protected columnLabel(status: TodoStatus): string {
    const columns = this.i18n.dict().todoPage.columns;
    return status === 'todo' ? columns.todo : status === 'in_progress' ? columns.inProgress : columns.done;
  }

  protected async addTodo(): Promise<void> {
    const title = this.newTitle().trim();
    if (!title) return;
    await this.todos.create(title);
    this.newTitle.set('');
  }

  protected async move(id: number, status: TodoStatus): Promise<void> {
    await this.todos.setStatus(id, status);
  }

  protected async remove(id: number): Promise<void> {
    await this.todos.remove(id);
  }

  protected nextStatus(status: TodoStatus): TodoStatus | null {
    if (status === 'todo') return 'in_progress';
    if (status === 'in_progress') return 'done';
    return null;
  }

  protected previousStatus(status: TodoStatus): TodoStatus | null {
    if (status === 'done') return 'in_progress';
    if (status === 'in_progress') return 'todo';
    return null;
  }
}
