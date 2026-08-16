import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import type { AuthSession } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  private readonly session = signal<AuthSession | null>(null);
  private sessionCheck: Promise<AuthSession> | null = null;

  readonly isAuthenticated = () => this.session()?.authenticated ?? false;
  readonly username = () => this.session()?.username ?? null;
  readonly checked = () => this.session() !== null;

  /** Ensures the session has been checked with the server at least once. */
  async ensureChecked(): Promise<AuthSession> {
    if (this.session()) {
      return this.session()!;
    }
    return this.refresh();
  }

  async refresh(): Promise<AuthSession> {
    if (!this.sessionCheck) {
      this.sessionCheck = firstValueFrom(this.http.get<AuthSession>(`${this.baseUrl}/session.php`))
        .then((result) => {
          this.session.set(result);
          return result;
        })
        .finally(() => {
          this.sessionCheck = null;
        });
    }
    return this.sessionCheck;
  }

  async login(username: string, password: string): Promise<AuthSession> {
    const result = await firstValueFrom(
      this.http.post<AuthSession>(`${this.baseUrl}/login.php`, { username, password }),
    );
    this.session.set(result);
    return result;
  }

  async logout(): Promise<void> {
    await firstValueFrom(this.http.post<AuthSession>(`${this.baseUrl}/logout.php`, {}));
    this.session.set({ authenticated: false });
  }
}
