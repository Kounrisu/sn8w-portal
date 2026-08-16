import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import type { Todo, TodoStatus } from './models';

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

  async create(title: string, status: TodoStatus = 'todo', diaryDate: string | null = null): Promise<Todo> {
    const todo = await firstValueFrom(
      this.http.post<Todo>(this.baseUrl, { title, status, diaryDate }),
    );
    if (diaryDate === null) {
      this.board.update((todos) => [...todos, todo]);
    }
    return todo;
  }

  async setStatus(id: number, status: TodoStatus): Promise<Todo> {
    const updated = await firstValueFrom(
      this.http.put<Todo>(this.baseUrl, { status }, { params: { id } }),
    );
    this.board.update((todos) => todos.map((t) => (t.id === id ? updated : t)));
    return updated;
  }

  async rename(id: number, title: string): Promise<Todo> {
    const updated = await firstValueFrom(
      this.http.put<Todo>(this.baseUrl, { title }, { params: { id } }),
    );
    this.board.update((todos) => todos.map((t) => (t.id === id ? updated : t)));
    return updated;
  }

  async remove(id: number): Promise<void> {
    await firstValueFrom(this.http.delete(this.baseUrl, { params: { id } }));
    this.board.update((todos) => todos.filter((t) => t.id !== id));
  }
}
