import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
  consent: boolean;
  lang: 'fr' | 'en';
  /** Honeypot: always empty for a real visitor. */
  website: string;
  /** Time the visitor took to fill the form, in ms (bots are instant). */
  elapsedMs: number;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  lang: 'fr' | 'en';
  mailSent: boolean;
  read: boolean;
  /** MySQL UTC timestamp, "YYYY-MM-DD HH:MM:SS". */
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);
  private readonly sendUrl = `${environment.apiBaseUrl}/contact.php`;
  private readonly adminUrl = `${environment.apiBaseUrl}/contact-messages.php`;

  /** Public: send a message through the contact form. */
  async send(payload: ContactPayload): Promise<void> {
    await firstValueFrom(this.http.post<{ ok: boolean }>(this.sendUrl, payload));
  }

  /** Admin only. */
  async list(): Promise<{ messages: ContactMessage[]; unread: number }> {
    return firstValueFrom(this.http.get<{ messages: ContactMessage[]; unread: number }>(this.adminUrl));
  }

  async setRead(id: number, read: boolean): Promise<ContactMessage> {
    return firstValueFrom(this.http.put<ContactMessage>(this.adminUrl, { read }, { params: { id } }));
  }

  async remove(id: number): Promise<void> {
    await firstValueFrom(this.http.delete(this.adminUrl, { params: { id } }));
  }
}
