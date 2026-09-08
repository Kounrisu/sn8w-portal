import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface ChangelogCommit {
  readonly sha: string;
  readonly date: string;
  readonly subject: string;
  readonly author: string;
}

export interface Changelog {
  readonly generatedAt: string;
  readonly totalCommits: number;
  readonly firstListedAt: string | null;
  readonly commits: readonly ChangelogCommit[];
}

/**
 * Loads `changelog.json`, written from the git log at build time by
 * `scripts/generate-changelog.mjs`.
 *
 * A missing file is a normal state, not an error: it means nobody ran
 * `npm run changelog` for this build. The page says so plainly rather than
 * showing an empty list that looks like the project has no history.
 */
@Injectable({ providedIn: 'root' })
export class ChangelogService {
  private readonly http = inject(HttpClient);

  readonly changelog = signal<Changelog | null>(null);
  readonly loaded = signal(false);

  async load(): Promise<void> {
    if (this.loaded()) return;
    try {
      this.changelog.set(await firstValueFrom(this.http.get<Changelog>('changelog.json')));
    } catch {
      this.changelog.set(null);
    } finally {
      this.loaded.set(true);
    }
  }
}
