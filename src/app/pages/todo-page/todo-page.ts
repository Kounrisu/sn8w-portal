import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DragDropModule, moveItemInArray, type CdkDragDrop } from '@angular/cdk/drag-drop';
import { TodosService } from '../../core/todos.service';
import { I18nService } from '../../core/i18n/i18n.service';
import type { Todo, TodoPriority, TodoStatus } from '../../core/models';

type StatusFilter = TodoStatus | 'all';

@Component({
  selector: 'sn8w-todo-page',
  imports: [FormsModule, RouterLink, DragDropModule],
  templateUrl: './todo-page.html',
  styleUrl: './todo-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoPage {
  protected readonly i18n = inject(I18nService);
  protected readonly todos = inject(TodosService);

  protected readonly search = signal('');
  protected readonly statusFilter = signal<StatusFilter>('all');

  protected readonly statusFilters: readonly StatusFilter[] = ['all', 'todo', 'in_progress', 'done'];

  protected readonly filtered = computed<Todo[]>(() => {
    const query = this.search().trim().toLowerCase();
    const status = this.statusFilter();

    return this.todos.board().filter((todo) => {
      if (status !== 'all' && todo.status !== status) return false;
      if (query && !todo.title.toLowerCase().includes(query)) return false;
      return true;
    });
  });

  constructor() {
    void this.todos.loadBoard();
  }

  protected statusLabel(status: TodoStatus): string {
    const columns = this.i18n.dict().todoPage.columns;
    if (status === 'todo') return columns.todo;
    if (status === 'in_progress') return columns.inProgress;
    return columns.done;
  }

  protected filterLabel(filter: StatusFilter): string {
    return filter === 'all' ? this.i18n.dict().todoPage.filterAll : this.statusLabel(filter);
  }

  protected priorityLabel(priority: TodoPriority): string {
    return this.i18n.dict().todoPage.priority[priority];
  }

  protected ticketId(id: number): string {
    return `SN-${id}`;
  }

  protected relativeTime(iso: string): string {
    const date = new Date(iso.replace(' ', 'T') + 'Z');
    const diffSeconds = (date.getTime() - Date.now()) / 1000;
    const rtf = new Intl.RelativeTimeFormat(this.i18n.lang(), { numeric: 'auto' });

    const units: readonly [Intl.RelativeTimeFormatUnit, number][] = [
      ['year', 60 * 60 * 24 * 365],
      ['month', 60 * 60 * 24 * 30],
      ['day', 60 * 60 * 24],
      ['hour', 60 * 60],
      ['minute', 60],
    ];

    for (const [unit, seconds] of units) {
      if (Math.abs(diffSeconds) >= seconds) {
        return rtf.format(Math.round(diffSeconds / seconds), unit);
      }
    }
    return rtf.format(Math.round(diffSeconds / 60) || 0, 'minute');
  }

  protected async remove(id: number, event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    if (!confirm(this.i18n.dict().todoDetailPage.deleteConfirm)) return;
    await this.todos.remove(id);
  }

  protected async drop(event: CdkDragDrop<Todo[]>): Promise<void> {
    if (event.previousIndex === event.currentIndex) return;

    // Reordering only makes sense against the unfiltered board — apply the
    // move to the full list, not the (possibly filtered) view being dragged.
    const board = [...this.todos.board()];
    const moved = this.filtered()[event.previousIndex];
    const from = board.findIndex((t) => t.id === moved.id);
    const to = board.findIndex((t) => t.id === this.filtered()[event.currentIndex].id);
    if (from === -1 || to === -1) return;

    moveItemInArray(board, from, to);
    await this.todos.reorderBoard(board);
  }
}
