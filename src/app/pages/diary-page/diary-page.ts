import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DiaryService } from '../../core/diary.service';
import { TodosService } from '../../core/todos.service';
import { I18nService } from '../../core/i18n/i18n.service';
import type { Todo } from '../../core/models';

function todayIso(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 10);
}

@Component({
  selector: 'sn8w-diary-page',
  imports: [FormsModule],
  templateUrl: './diary-page.html',
  styleUrl: './diary-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiaryPage {
  protected readonly i18n = inject(I18nService);
  private readonly diary = inject(DiaryService);
  private readonly todosApi = inject(TodosService);

  protected readonly today = todayIso();
  protected readonly selectedDate = signal(this.today);
  protected readonly notes = signal('');
  protected readonly saved = signal(false);
  protected readonly dates = signal<string[]>([]);
  protected readonly dayTodos = signal<Todo[]>([]);
  protected readonly newTodoTitle = signal('');

  constructor() {
    void this.loadDates();
    void this.loadDay(this.selectedDate());
  }

  private async loadDates(): Promise<void> {
    this.dates.set(await this.diary.listDates());
  }

  protected async loadDay(date: string): Promise<void> {
    this.selectedDate.set(date);
    this.saved.set(false);
    const [entry, todos] = await Promise.all([
      this.diary.getEntry(date),
      this.todosApi.forDate(date),
    ]);
    this.notes.set(entry.notes);
    this.dayTodos.set(todos);
  }

  protected async save(): Promise<void> {
    await this.diary.saveEntry(this.selectedDate(), this.notes());
    this.saved.set(true);
    await this.loadDates();
  }

  protected async addTodo(): Promise<void> {
    const title = this.newTodoTitle().trim();
    if (!title) return;
    const todo = await this.todosApi.create(title, 'todo', this.selectedDate());
    this.dayTodos.update((todos) => [...todos, todo]);
    this.newTodoTitle.set('');
    await this.loadDates();
  }

  protected async toggleDone(todo: Todo): Promise<void> {
    const status = todo.status === 'done' ? 'todo' : 'done';
    const updated = await this.todosApi.setStatus(todo.id, status);
    this.dayTodos.update((todos) => todos.map((t) => (t.id === todo.id ? updated : t)));
  }

  protected async removeTodo(id: number): Promise<void> {
    await this.todosApi.remove(id);
    this.dayTodos.update((todos) => todos.filter((t) => t.id !== id));
  }
}
