import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import type { Todo, TodoInput } from './models';

@Injectable({ providedIn: 'root' })
export class TodosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/todos.php`;

  readonly board = signal<Todo[]>([]);
  readonly loaded = signal(false);

  async loadBoard(): Promise<void> {
    const todos = await firstValueFrom(this.http.get<Todo[]>(this.baseUrl));
    this.board.set(todos);
    this.loaded.set(true);
  }

  async forDate(date: string): Promise<Todo[]> {
    return firstValueFrom(this.http.get<Todo[]>(this.baseUrl, { params: { date } }));
  }

  async get(id: number): Promise<Todo> {
    return firstValueFrom(this.http.get<Todo>(this.baseUrl, { params: { id } }));
  }

  async create(input: TodoInput): Promise<Todo> {
    const todo = await firstValueFrom(this.http.post<Todo>(this.baseUrl, input));
    this.board.update((todos) => [...todos, todo]);
    return todo;
  }

  async update(id: number, input: Partial<TodoInput>): Promise<Todo> {
    const updated = await firstValueFrom(
      this.http.put<Todo>(this.baseUrl, input, { params: { id } }),
    );
    this.board.update((todos) => todos.map((t) => (t.id === id ? updated : t)));
    return updated;
  }

  /** Progress alone — status is derived server-side, never set directly. */
  async setProgress(id: number, progress: number): Promise<Todo> {
    return this.update(id, { progress });
  }

  async remove(id: number): Promise<void> {
    await firstValueFrom(this.http.delete(this.baseUrl, { params: { id } }));
    this.board.update((todos) => todos.filter((t) => t.id !== id));
  }

  /**
   * Persists a new drag-and-drop order for the general board. Reconciles
   * `board` with each PUT's confirmed response rather than trusting the
   * optimistic order — leaving stale `sortOrder` values around let a later
   * reorder in the same session compare against numbers the server had
   * already moved past. On any failed PUT, reloads from the server instead
   * of leaving the optimistic order and the backend permanently diverged.
   */
  async reorderBoard(newOrder: Todo[]): Promise<void> {
    this.board.set(newOrder);
    try {
      const updates = await Promise.all(
        newOrder.map((todo, index) =>
          todo.sortOrder === index
            ? Promise.resolve(null)
            : firstValueFrom(
                this.http.put<Todo>(this.baseUrl, { sortOrder: index }, { params: { id: todo.id } }),
              ),
        ),
      );
      const byId = new Map(updates.filter((u): u is Todo => u !== null).map((u) => [u.id, u]));
      if (byId.size > 0) {
        this.board.update((todos) => todos.map((t) => byId.get(t.id) ?? t));
      }
    } catch (e) {
      await this.loadBoard();
      throw e;
    }
  }
}
