import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import type { DiaryEntry } from './models';

@Injectable({ providedIn: 'root' })
export class DiaryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/diary.php`;

  async listDates(): Promise<string[]> {
    return firstValueFrom(this.http.get<string[]>(this.baseUrl));
  }

  async getEntry(date: string): Promise<DiaryEntry> {
    return firstValueFrom(this.http.get<DiaryEntry>(this.baseUrl, { params: { date } }));
  }

  async saveEntry(date: string, notes: string): Promise<DiaryEntry> {
    return firstValueFrom(
      this.http.put<DiaryEntry>(this.baseUrl, { notes }, { params: { date } }),
    );
  }
}
